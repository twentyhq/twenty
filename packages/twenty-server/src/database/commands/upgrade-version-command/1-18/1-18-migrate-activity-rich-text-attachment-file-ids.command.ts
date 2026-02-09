import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import {
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';
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
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

type RichTextBlock = Record<string, unknown>;

@Command({
  name: 'upgrade:1-18:migrate-activity-rich-text-attachment-file-ids',
  description:
    'Migrate activity rich text blocks to include attachmentFileId from attachment.file field',
})
export class MigrateActivityRichTextAttachmentFileIdsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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

    const isFilesFieldMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
      workspaceId,
    );

    if (isFilesFieldMigrated) {
      this.logger.log(
        `Files field already migrated for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting activity rich text attachment file IDs migration for workspace ${workspaceId}`,
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

    const attachmentFileUniversalIdentifier =
      STANDARD_OBJECTS.attachment.fields.file.universalIdentifier;

    let attachmentFileFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
      attachmentObjectMetadata,
      flatFieldMetadataMaps,
    ).find(
      (field) =>
        field.universalIdentifier === attachmentFileUniversalIdentifier,
    );

    if (!isDefined(attachmentFileFieldMetadata)) {
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
            universalIdentifier: attachmentFileUniversalIdentifier,
          },
          workspaceId,
          ownerFlatApplication: twentyStandardApplication,
        });

        const { flatFieldMetadataMaps: updatedFlatFieldMetadataMaps } =
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatFieldMetadataMaps',
          ]);

        attachmentFileFieldMetadata = getFlatFieldsFromFlatObjectMetadata(
          attachmentObjectMetadata,
          updatedFlatFieldMetadataMaps,
        ).find(
          (field) =>
            field.universalIdentifier === attachmentFileUniversalIdentifier,
        );
      }
    }

    if (!isDefined(attachmentFileFieldMetadata)) {
      this.logger.error(
        `Failed to create attachment file field metadata for workspace ${workspaceId}`,
      );

      return;
    }

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepository<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
        { shouldBypassPermissionChecks: true },
      );

    const noteRepository =
      await this.twentyORMGlobalManager.getRepository<NoteWorkspaceEntity>(
        workspaceId,
        'note',
        { shouldBypassPermissionChecks: true },
      );

    const taskRepository =
      await this.twentyORMGlobalManager.getRepository<TaskWorkspaceEntity>(
        workspaceId,
        'task',
        { shouldBypassPermissionChecks: true },
      );

    const fileRepository = this.coreDataSource.getRepository(FileEntity);

    await this.migrateActivityTable(
      noteRepository,
      attachmentRepository,
      fileRepository,
      'note',
      'targetNoteId',
      workspaceId,
      twentyStandardApplication,
      attachmentFileFieldMetadata,
      isDryRun,
    );

    await this.migrateActivityTable(
      taskRepository,
      attachmentRepository,
      fileRepository,
      'task',
      'targetTaskId',
      workspaceId,
      twentyStandardApplication,
      attachmentFileFieldMetadata,
      isDryRun,
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed activity rich text attachment file IDs migration for workspace ${workspaceId}`,
    );
  }

  private async migrateActivityTable(
    activityRepository:
      | Awaited<ReturnType<GlobalWorkspaceOrmManager['getRepository']>>
      | Repository<NoteWorkspaceEntity>
      | Repository<TaskWorkspaceEntity>,
    attachmentRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
    fileRepository: Repository<FileEntity>,
    activityType: 'note' | 'task',
    targetColumnName: 'targetNoteId' | 'targetTaskId',
    workspaceId: string,
    twentyStandardApplication: { id: string; universalIdentifier: string },
    fileFieldMetadata: { universalIdentifier: string },
    isDryRun: boolean,
  ): Promise<void> {
    this.logger.log(
      `Migrating ${activityType} rich text for workspace ${workspaceId}`,
    );

    const activities = await activityRepository.find({
      select: ['id', 'bodyV2Blocknote', 'bodyV2Markdown'],
    });

    this.logger.log(
      `Found ${activities.length} ${activityType}(s) to process in workspace ${workspaceId}`,
    );

    for (const activity of activities) {
      const bodyV2 = activity.bodyV2;

      if (!isDefined(bodyV2?.blocknote)) {
        continue;
      }

      let blocknote: RichTextBlock[];

      try {
        blocknote = JSON.parse(bodyV2.blocknote);
      } catch (error) {
        this.logger.warn(
          `Failed to parse bodyV2.blocknote for ${activityType} ${activity.id}: ${error.message}`,
        );
        continue;
      }

      const needsMigration = blocknote.some((block: RichTextBlock) => {
        const props = block.props as Record<string, unknown>;

        return (
          isDefined(props?.url) && !isNonEmptyString(props?.attachmentFileId)
        );
      });

      if (!needsMigration) {
        continue;
      }

      const urlToFileIdMap = await this.buildUrlToFileIdMap(
        attachmentRepository,
        targetColumnName,
        activity.id,
      );

      let hasChanges = false;
      const enrichedBlocknote = [];

      for (const block of blocknote) {
        const props = (block.props as Record<string, unknown>) || {};
        const url = props.url as string | undefined;

        if (!isDefined(url) || isNonEmptyString(props.attachmentFileId)) {
          enrichedBlocknote.push(block);
          continue;
        }

        let fileId = this.findMatchingFileId(url, urlToFileIdMap);

        if (!isDefined(fileId) && !isDryRun) {
          const createdFileId = await this.createAttachmentFromUrl(
            url,
            block,
            attachmentRepository,
            fileRepository,
            targetColumnName,
            activity.id,
            workspaceId,
            twentyStandardApplication,
            fileFieldMetadata,
          );

          if (isDefined(createdFileId)) {
            fileId = createdFileId;
          }
        }

        if (isDefined(fileId)) {
          this.logger.log(
            `Enriching ${block.type} block in ${activityType} ${activity.id} with fileId: ${fileId}`,
          );
          hasChanges = true;

          enrichedBlocknote.push({
            ...block,
            props: {
              ...props,
              attachmentFileId: fileId,
            },
          });
        } else {
          enrichedBlocknote.push(block);
        }
      }

      if (hasChanges && !isDryRun) {
        const updatedBodyV2 = {
          ...bodyV2,
          blocknote: JSON.stringify(enrichedBlocknote),
        };

        await activityRepository.update(
          { id: activity.id },
          { bodyV2: updatedBodyV2 },
        );
      }
    }
  }

  private async buildUrlToFileIdMap(
    attachmentRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
    targetColumnName: 'targetNoteId' | 'targetTaskId',
    activityId: string,
  ): Promise<Map<string, string>> {
    const urlToFileIdMap = new Map<string, string>();

    const attachments = await attachmentRepository.find({
      where: {
        [targetColumnName]: activityId,
      },
      select: ['fullPath', 'file'],
    });

    for (const attachment of attachments) {
      if (
        isDefined(attachment.file) &&
        Array.isArray(attachment.file) &&
        attachment.file.length > 0
      ) {
        const fileData = attachment.file[0];

        if (isDefined(attachment.fullPath) && isDefined(fileData.fileId)) {
          const normalizedPath = this.getAttachmentLegacyRelativePath(
            attachment.fullPath,
          );

          urlToFileIdMap.set(normalizedPath, fileData.fileId);
        } else if (isDefined(fileData?.url)) {
          const normalizedPath = this.getAttachmentNewdRelativePath(
            fileData.url,
          );

          urlToFileIdMap.set(normalizedPath, fileData.fileId);
        }
      }
    }

    return urlToFileIdMap;
  }

  private findMatchingFileId(
    url: string,
    urlToFileIdMap: Map<string, string>,
  ): string | undefined {
    const normalizedUrl = url.includes(FileFolder.FilesField)
      ? this.getAttachmentNewdRelativePath(url)
      : this.getAttachmentLegacyRelativePath(url);

    return urlToFileIdMap.get(normalizedUrl);
  }

  private async createAttachmentFromUrl(
    url: string,
    block: RichTextBlock,
    attachmentRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >,
    fileRepository: Repository<FileEntity>,
    targetColumnName: 'targetNoteId' | 'targetTaskId',
    activityId: string,
    workspaceId: string,
    twentyStandardApplication: { id: string; universalIdentifier: string },
    fileFieldMetadata: { universalIdentifier: string },
  ): Promise<string | undefined> {
    try {
      const props = block.props as Record<string, unknown>;
      const blockName = (props.name as string) || '';

      const filePath = this.getAttachmentLegacyRelativePath(url);

      const {
        type: fileExtension,
        filename,
        folderPath,
      } = extractFolderPathFilenameAndTypeOrThrow(filePath);

      const fileId = v4();
      const newFilename = `${fileId}${isNonEmptyString(fileExtension) ? `.${fileExtension}` : ''}`;
      const newResourcePath = `${FileFolder.FilesField}/${fileFieldMetadata.universalIdentifier}/${newFilename}`;

      await this.fileStorageService.copy({
        from: {
          folderPath: `workspace-${workspaceId}/${folderPath}`,
          filename: filename,
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

      const attachmentName = isNonEmptyString(blockName) ? blockName : filename;

      await attachmentRepository.save({
        [targetColumnName]: activityId,
        name: attachmentName,
        file: [
          {
            fileId: fileEntity.id,
            label: attachmentName,
          },
        ],
      });

      this.logger.log(
        `Created attachment for ${block.type} block with URL: ${url}`,
      );

      return fileId;
    } catch (error) {
      this.logger.error(
        `Failed to create attachment from URL ${url}: ${error.message}`,
      );

      return undefined;
    }
  }

  getAttachmentLegacyRelativePath = (url: string): string => {
    if (!url.includes('/files/attachment/')) {
      throw new Error(`Invalid attachment legacy relative path: ${url}`);
    }

    //https://example.com/files/attachment/token/filename.jpg -> attachment/filename.jpg
    const attachmentPath = url.split('/files/attachment/')[1].split('/')[1];

    return `${FileFolder.Attachment}/${attachmentPath}`;
  };

  getAttachmentNewdRelativePath = (url: string): string => {
    if (!url.includes('/files-field/')) {
      throw new Error(`Invalid new attachment path: ${url}`);
    }

    //https://example.com/files-field/123/456/789/filename.jpg -> files-field/123/456/789/filename.jpg
    const attachmentPath = url.split('/files-field/')[1];

    return `${FileFolder.FilesField}/${attachmentPath}`;
  };
}
