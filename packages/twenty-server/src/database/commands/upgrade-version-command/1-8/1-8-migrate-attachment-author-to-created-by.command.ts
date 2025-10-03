import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@Command({
  name: 'upgrade:1-8:1-8-migrate-attachment-author-to-created-by',
  description:
    'Migrate attachment author relation to createdBy composite field',
})
export class MigrateAttachmentAuthorToCreatedByCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource: _dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    // Find the attachment object metadata
    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOne({
        where: {
          workspaceId,
          standardId: STANDARD_OBJECT_IDS.attachment,
        },
      });

    if (!attachmentObjectMetadata) {
      this.logger.log(
        `Attachment object metadata not found for workspace ${workspaceId}, skipping migration`,
      );

      return;
    }

    this.logger.log(
      `Migrating attachment author to createdBy for workspace ${workspaceId}`,
    );

    // Get the workspace member repository to fetch names
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workspaceMember',
      );

    // Fetch all workspace members to build a mapping of id to name
    const workspaceMembers = await workspaceMemberRepository.find();
    const memberMap = new Map(
      workspaceMembers.map((member) => [
        member.id,
        {
          firstName: member.name?.firstName || '',
          lastName: member.name?.lastName || '',
        },
      ]),
    );

    this.logger.log(
      `Found ${workspaceMembers.length} workspace members for workspace ${workspaceId}`,
    );

    // Get the attachment repository
    const attachmentRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'attachment',
      );

    // Get all attachments with an author
    const attachments = await attachmentRepository.find({
      where: {},
      select: ['id', 'authorId'],
    });

    this.logger.log(
      `Found ${attachments.length} attachments for workspace ${workspaceId}`,
    );

    // Update attachments with createdBy data from author
    let migratedCount = 0;

    for (const attachment of attachments) {
      if (!attachment.authorId) {
        continue;
      }

      const memberInfo = memberMap.get(attachment.authorId);

      if (!memberInfo) {
        this.logger.warn(
          `Workspace member ${attachment.authorId} not found for attachment ${attachment.id}, skipping`,
        );
        continue;
      }

      const fullName = `${memberInfo.firstName} ${memberInfo.lastName}`.trim();
      const displayName =
        fullName || memberInfo.firstName || memberInfo.lastName || 'Unknown';

      try {
        await attachmentRepository.update(attachment.id, {
          createdBy: {
            source: FieldActorSource.MANUAL,
            workspaceMemberId: attachment.authorId,
            name: displayName,
            context: {},
          },
        });

        migratedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to migrate attachment ${attachment.id}: ${error}`,
        );
      }
    }

    this.logger.log(
      `Successfully migrated ${migratedCount} attachments for workspace ${workspaceId}`,
    );
  }
}
