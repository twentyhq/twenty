import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@RegisteredWorkspaceCommand('1.21.0', 1775500011000)
@Command({
  name: 'upgrade:1-21:migrate-message-folder-parent-id-to-external-id',
  description:
    'Migrate messageFolder parentFolderId from internal UUID references to external IDs',
})
export class MigrateMessageFolderParentIdToExternalIdCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    @InjectRepository(MessageFolderEntity)
    private readonly messageFolderRepository: Repository<MessageFolderEntity>,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const folders = await this.messageFolderRepository.find({
      where: { workspaceId },
    });

    const idToExternalIdMap = new Map<string, string>();
    const existingExternalIds = new Set<string>();

    for (const folder of folders) {
      if (folder.externalId) {
        idToExternalIdMap.set(folder.id, folder.externalId);
        existingExternalIds.add(folder.externalId);
      }
    }

    let migratedCount = 0;

    for (const folder of folders) {
      if (!folder.parentFolderId) {
        continue;
      }

      if (!UUID_REGEX.test(folder.parentFolderId)) {
        continue;
      }

      // Already points to a valid externalId — skip even if it looks like a UUID
      if (existingExternalIds.has(folder.parentFolderId)) {
        continue;
      }

      const parentExternalId = idToExternalIdMap.get(folder.parentFolderId);

      if (!parentExternalId) {
        this.logger.warn(
          `Folder ${folder.id}: parent ${folder.parentFolderId} not found or has no externalId, setting to null`,
        );

        if (!isDryRun) {
          await this.messageFolderRepository.update(folder.id, {
            parentFolderId: null,
          });
        }

        migratedCount++;
        continue;
      }

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would update folder ${folder.id}: parentFolderId ${folder.parentFolderId} -> ${parentExternalId}`,
        );
      } else {
        await this.messageFolderRepository.update(folder.id, {
          parentFolderId: parentExternalId,
        });
      }

      migratedCount++;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Migrated ${migratedCount} folder(s) for workspace ${workspaceId}`,
    );
  }
}
