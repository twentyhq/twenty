import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import {
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { DataSource, Equal, IsNull, Not, Or, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

@Command({
  name: 'upgrade:1-18:migrate-attachment-files',
  description:
    'Migrate attachment files to file field: copy files and create file records',
})
export class MigrateAttachmentFilesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
      workspaceId,
    );

    if (isMigrated) {
      this.logger.log(
        `Attachment files migration already completed for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting attachment files migration for workspace ${workspaceId}`,
    );

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatApplicationMaps',
    ]);

    const attachmentObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
      });

    if (!isDefined(attachmentObjectMetadata)) {
      this.logger.warn(
        `Attachment object metadata not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const twentyStandardApplication = Object.values(
      flatApplicationMaps.byId,
    ).find(
      (app) =>
        app?.universalIdentifier ===
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );

    if (!isDefined(twentyStandardApplication)) {
      this.logger.error(
        `Twenty standard application not found for workspace ${workspaceId}`,
      );

      return;
    }

    const fileUniversalIdentifier =
      STANDARD_OBJECTS.attachment.fields.file.universalIdentifier;

    let fileFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
      attachmentObjectMetadata,
      flatFieldMetadataMaps,
    ).find(
      (field) =>
        field.type === FieldMetadataType.FILES &&
        field.universalIdentifier === fileUniversalIdentifier,
    ) as FlatFieldMetadata | undefined;

    if (!isDefined(fileFieldMetadata)) {
      this.logger.log(
        `File field metadata not found for attachments in workspace ${workspaceId}, creating it`,
      );

      if (!isDryRun) {
        await this.fieldMetadataService.createOneField({
          createFieldInput: {
            objectMetadataId: attachmentObjectMetadata.id,
            type: FieldMetadataType.FILES,
            name: 'file',
            label: 'File',
            description: 'Attachment file',
            icon: 'IconFileUpload',
            isNullable: true,
            isUIReadOnly: true,
            isSystem: true,
            settings: {
              maxNumberOfValues: 1,
            },
            universalIdentifier: fileUniversalIdentifier,
          },
          workspaceId,
          ownerFlatApplication: twentyStandardApplication,
        });

        const { flatFieldMetadataMaps: updatedFlatFieldMetadataMaps } =
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatFieldMetadataMaps',
          ]);

        fileFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
          attachmentObjectMetadata,
          updatedFlatFieldMetadataMaps,
        ).find(
          (field) =>
            field.type === FieldMetadataType.FILES &&
            field.universalIdentifier === fileUniversalIdentifier,
        ) as FlatFieldMetadata | undefined;

        if (!isDefined(fileFieldMetadata)) {
          this.logger.error(
            `Failed to create file field metadata for workspace ${workspaceId}`,
          );

          return;
        }
      }
      this.logger.log(
        `Created file field metadata for attachments in workspace ${workspaceId}`,
      );
    }

    if (!isDefined(fileFieldMetadata)) {
      this.logger.error(
        `File field metadata not found for attachments in workspace ${workspaceId}`,
      );

      return;
    }

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepository<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
        { shouldBypassPermissionChecks: true },
      );

    const attachments = await attachmentRepository.find({
      where: {
        fullPath: Not(IsNull()),
        file: Or(IsNull(), Equal([])),
      },
      select: ['id', 'name', 'fullPath'],
    });

    if (attachments.length === 0) {
      this.logger.log(`No attachments to migrate for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `Found ${attachments.length} attachment(s) to migrate in workspace ${workspaceId}`,
    );

    const fileRepository = this.coreDataSource.getRepository(FileEntity);

    for (const attachment of attachments) {
      if (!isNonEmptyString(attachment.fullPath)) {
        this.logger.warn(
          `Skipping attachment ${attachment.id} - invalid fullPath`,
        );

        continue;
      }

      try {
        const { type: fileExtension, filename } =
          extractFolderPathFilenameAndTypeOrThrow(attachment.fullPath);

        const fileId = v4();
        const newFilename = `${fileId}${isNonEmptyString(fileExtension) ? `.${fileExtension}` : ''}`;
        const newResourcePath = `${FileFolder.FilesField}/${fileFieldMetadata.universalIdentifier}/${newFilename}`;

        if (!isDryRun) {
          await this.fileStorageService.copy({
            from: {
              folderPath: `workspace-${workspaceId}`,
              filename: attachment.fullPath,
            },
            to: {
              folderPath: `${workspaceId}/${twentyStandardApplication.universalIdentifier}`,
              filename: newResourcePath,
            },
          });

          const fileEntity = fileRepository.create({
            id: fileId,
            path: newResourcePath,
            workspaceId,
            applicationId: twentyStandardApplication.id,
            size: -1,
            settings: {
              isTemporaryFile: true,
              toDelete: false,
            },
          });

          await fileRepository.save(fileEntity);

          await attachmentRepository.update(
            { id: attachment.id },
            {
              file: [
                {
                  fileId: fileEntity.id,
                  label: attachment.name || filename,
                },
              ],
            },
          );
        }

        this.logger.log(
          `Migrated attachment ${attachment.id} (${attachment.name})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to migrate attachment ${attachment.id} in workspace ${workspaceId}: ${error.message}`,
        );
        throw error;
      }
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed attachment files migration for workspace ${workspaceId}`,
    );
  }
}
