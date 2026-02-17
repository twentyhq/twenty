import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { DataSource, Equal, ILike, IsNull, Or, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Command({
  name: 'upgrade:1-18:migrate-person-avatar-files',
  description:
    'Migrate person avatarUrl files to file field: copy files and create file records',
})
export class MigratePersonAvatarFilesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly fileStorageService: FileStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly applicationService: ApplicationService,
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
        `Person avatar files migration already completed for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${
        isDryRun ? '[DRY RUN] ' : ''
      }Starting person avatar files migration for workspace ${workspaceId}`,
    );

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const personObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      });

    if (!isDefined(personObjectMetadata)) {
      this.logger.warn(
        `Person object metadata not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    if (!isDefined(twentyStandardFlatApplication)) {
      this.logger.error(
        `Twenty standard application not found for workspace ${workspaceId}`,
      );

      return;
    }

    let avatarFileFieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.person.fields.avatarFile.universalIdentifier,
    });

    if (!isDefined(avatarFileFieldMetadata)) {
      this.logger.log(
        `Avatar file field metadata not found for workspace ${workspaceId}, creating it`,
      );

      if (!isDryRun) {
        const personFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
          personObjectMetadata,
          flatFieldMetadataMaps,
        );

        const existingFieldWithSameName = personFieldMetadatas.find(
          (fieldMetadata) => fieldMetadata.name === 'avatarFile',
        );

        if (isDefined(existingFieldWithSameName)) {
          this.logger.log(
            `Found existing field with name 'avatarFile' (id: ${existingFieldWithSameName.id}), renaming it to 'old-avatarFile'`,
          );

          try {
            await this.fieldMetadataService.updateOneField({
              updateFieldInput: {
                id: existingFieldWithSameName.id,
                name: 'oldAvatarFile',
                label: 'Old Avatar File',
              },
              workspaceId,
              ownerFlatApplication: twentyStandardFlatApplication,
            });
          } catch (error) {
            this.logger.error(
              `Failed to rename existing 'avatarFile' field to 'old-avatarFile' for workspace ${workspaceId}: ${error.message}`,
            );
            throw error;
          }

          this.logger.log(
            `Renamed existing 'avatarFile' field to 'oldAvatarFile' for workspace ${workspaceId}`,
          );
        }

        try {
          avatarFileFieldMetadata =
            await this.fieldMetadataService.createOneField({
              createFieldInput: {
                objectMetadataId: personObjectMetadata.id,
                type: FieldMetadataType.FILES,
                name: 'avatarFile',
                label: 'Avatar File',
                description: "Contact's avatar file",
                icon: 'IconFileUpload',
                isSystem: true,
                isNullable: true,
                settings: {
                  maxNumberOfValues: 1,
                },
                universalIdentifier:
                  STANDARD_OBJECTS.person.fields.avatarFile.universalIdentifier,
              },
              workspaceId,
              ownerFlatApplication: twentyStandardFlatApplication,
            });
        } catch (error) {
          this.logger.error(
            `Failed to create avatarFile field metadata for workspace ${workspaceId}: ${error.message}`,
          );
          throw error;
        }

        this.logger.log(
          `Created avatarFile field metadata for workspace ${workspaceId}`,
        );
      } else {
        this.logger.log(
          `[DRY RUN] Would create avatarFile field metadata for workspace ${workspaceId}`,
        );
      }
    }

    if (!isDefined(avatarFileFieldMetadata)) {
      this.logger.error(
        `Avatar file field metadata not found for workspace ${workspaceId}`,
      );

      return;
    }

    const personRepository =
      await this.twentyORMGlobalManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const personsWithAvatars = await personRepository.find({
      where: {
        avatarUrl: ILike(`%${FileFolder.PersonPicture}%`),
        avatarFile: Or(IsNull(), Equal([])),
      },
      select: ['id', 'avatarUrl'],
    });

    if (personsWithAvatars.length === 0) {
      this.logger.log(
        `No persons with avatarUrl found in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${personsWithAvatars.length} person(s) with avatarUrl containing 'people' folder in workspace ${workspaceId}`,
    );

    const fileRepository = this.coreDataSource.getRepository(FileEntity);

    for (const person of personsWithAvatars) {
      assertIsDefinedOrThrow(person.avatarUrl);

      try {
        const { type: fileExtension } = extractFolderPathFilenameAndTypeOrThrow(
          person.avatarUrl,
        );

        const fileId = v4();
        const newFileName = `${fileId}${isNonEmptyString(fileExtension) ? `.${fileExtension}` : ''}`;
        const newResourcePath = `${FileFolder.FilesField}/${avatarFileFieldMetadata.universalIdentifier}/${newFileName}`;

        if (!isDryRun) {
          await this.fileStorageService.copyLegacy({
            from: {
              folderPath: `workspace-${workspaceId}`,
              filename: person.avatarUrl,
            },
            to: {
              folderPath: `${workspaceId}/${twentyStandardFlatApplication.universalIdentifier}`,
              filename: newResourcePath,
            },
          });

          const fileEntity = fileRepository.create({
            id: fileId,
            path: newResourcePath,
            workspaceId,
            applicationId: twentyStandardFlatApplication.id,
            size: -1,
            settings: {
              isTemporaryFile: true,
              toDelete: false,
            },
          });

          await fileRepository.save(fileEntity);

          await personRepository.update(
            { id: person.id },
            {
              avatarFile: [
                {
                  fileId: fileEntity.id,
                  label: newFileName,
                },
              ],
            },
          );
        }

        this.logger.log(`Migrated avatar for person ${person.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to migrate avatar for person ${person.id} in workspace ${workspaceId}: ${error.message}`,
        );
        throw error;
      }
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed person avatar files migration for workspace ${workspaceId}`,
    );
  }
}
