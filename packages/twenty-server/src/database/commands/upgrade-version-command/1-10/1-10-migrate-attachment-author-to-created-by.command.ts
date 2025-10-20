import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Command({
  name: 'upgrade:1-8:migrate-attachment-author-to-created-by',
  description:
    'Migrate attachment author field data to createdBy composite field',
})
export class MigrateAttachmentAuthorToCreatedByCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Migrating attachment author to createdBy for workspace ${workspaceId}`,
    );

    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
        workspaceId,
        'attachment',
      );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const attachments = await attachmentRepository.find({
      where: {
        authorId: Not(IsNull()),
        createdBy: {
          workspaceMemberId: IsNull(),
        },
      },
      select: ['id', 'authorId'],
    });

    this.logger.log(
      `Found ${attachments.length} attachments to migrate for workspace ${workspaceId}`,
    );

    let migratedCount = 0;

    for (const attachment of attachments) {
      const { id, authorId } = attachment;

      if (!isDefined(authorId)) {
        continue;
      }

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: { id: authorId },
      });

      if (!isDefined(workspaceMember)) {
        this.logger.warn(
          `Workspace member ${authorId} not found for attachment ${id}, skipping`,
        );
        continue;
      }

      const firstName = workspaceMember.name?.firstName || '';
      const lastName = workspaceMember.name?.lastName || '';
      const displayName =
        firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Unknown';

      await attachmentRepository.update(
        { id },
        {
          createdBy: {
            source: FieldActorSource.MANUAL,
            workspaceMemberId: workspaceMember.id,
            name: displayName,
            context: {},
          },
        },
      );

      migratedCount++;
    }

    this.logger.log(
      `Successfully migrated ${migratedCount} attachments for workspace ${workspaceId}`,
    );
  }
}
