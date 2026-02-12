import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FileFolder } from 'twenty-shared/types';
import {
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FilesFieldService } from 'src/engine/core-modules/file/files-field/files-field.service';
import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
    private readonly applicationService: ApplicationService,
    private readonly filesFieldService: FilesFieldService,
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const attachmentFileFieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
    });

    if (!isDefined(attachmentFileFieldMetadata)) {
      this.logger.error(
        `Failed to find attachment file field metadata for workspace ${workspaceId}`,
      );

      throw new Error(
        `Failed to find attachment file field metadata for workspace ${workspaceId}`,
      );
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

    await this.migrateActivityTable({
      activityRepository: noteRepository,
      attachmentRepository,
      fileRepository,
      activityType: 'note',
      targetColumnName: 'targetNoteId',
      workspaceId,
      twentyStandardApplication: twentyStandardFlatApplication,
      fileFieldMetadata: attachmentFileFieldMetadata,
      isDryRun,
    });

    await this.migrateActivityTable({
      activityRepository: taskRepository,
      attachmentRepository,
      fileRepository,
      activityType: 'task',
      targetColumnName: 'targetTaskId',
      workspaceId,
      twentyStandardApplication: twentyStandardFlatApplication,
      fileFieldMetadata: attachmentFileFieldMetadata,
      isDryRun,
    });

    if (!isDryRun) {
      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_FILES_FIELD_MIGRATED],
        workspaceId,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Completed activity rich text attachment file IDs migration for workspace ${workspaceId}`,
    );
  }

  private async migrateActivityTable({
    activityRepository,
    attachmentRepository,
    fileRepository,
    activityType,
    targetColumnName,
    workspaceId,
    twentyStandardApplication,
    fileFieldMetadata,
    isDryRun,
  }: {
    activityRepository:
      | WorkspaceRepository<NoteWorkspaceEntity>
      | WorkspaceRepository<TaskWorkspaceEntity>;
    attachmentRepository: Awaited<
      ReturnType<GlobalWorkspaceOrmManager['getRepository']>
    >;
    fileRepository: Repository<FileEntity>;
    activityType: 'note' | 'task';
    targetColumnName: 'targetNoteId' | 'targetTaskId';
    workspaceId: string;
    twentyStandardApplication: { id: string; universalIdentifier: string };
    fileFieldMetadata: { universalIdentifier: string };
    isDryRun: boolean;
  }): Promise<void> {
    this.logger.log(
      `Migrating ${activityType} rich text for workspace ${workspaceId}`,
    );

    const activities = await activityRepository.find();

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
        const props = (block.props as Record<string, unknown>) || {};
        const url = props.url as string | undefined;

        return isDefined(url) && !isDefined(extractFileIdFromUrl(url));
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

        if (
          !isDefined(url) ||
          isDefined(extractFileIdFromUrl(url)) ||
          !url.includes('/files/attachment/')
        ) {
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

          const signedUrl = this.filesFieldService.signFileUrl({
            fileId,
            workspaceId,
          });

          enrichedBlocknote.push({
            ...block,
            props: {
              ...props,
              url: signedUrl,
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
          urlToFileIdMap.set(attachment.fullPath, fileData.fileId);
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

      await this.fileStorageService.copyLegacy({
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
