import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';

const TYPE_TO_FILE_CATEGORY_MAPPING: Record<string, string> = {
  Archive: 'ARCHIVE',
  Audio: 'AUDIO',
  Image: 'IMAGE',
  Presentation: 'PRESENTATION',
  Spreadsheet: 'SPREADSHEET',
  TextDocument: 'TEXT_DOCUMENT',
  Video: 'VIDEO',
  Other: 'OTHER',
};

@Command({
  name: 'upgrade:1-10:migrate-attachment-type-to-file-category',
  description:
    'Migrate attachment type field data to fileCategory SELECT field',
})
export class MigrateAttachmentTypeToFileCategoryCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Migrating attachment type to fileCategory for workspace ${workspaceId}`,
    );

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
      );

    const attachments = await attachmentRepository.find({
      select: ['id', 'type'],
    });

    this.logger.log(
      `Found ${attachments.length} attachments to migrate for workspace ${workspaceId}`,
    );

    let migratedCount = 0;

    for (const attachment of attachments) {
      const { id, type } = attachment;

      if (!isNonEmptyString(type)) {
        throw new Error(`Attachment ${id} has an empty type`);
      }

      const fileCategory =
        TYPE_TO_FILE_CATEGORY_MAPPING[type] ||
        TYPE_TO_FILE_CATEGORY_MAPPING.Other;

      await attachmentRepository.update(
        { id },
        {
          fileCategory,
        },
      );

      migratedCount++;
    }

    this.logger.log(
      `Successfully migrated ${migratedCount} attachments for workspace ${workspaceId}`,
    );
  }
}
