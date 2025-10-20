import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
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
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      this.logger.log(
        `Migrating attachment author to createdBy for workspace ${workspaceId}`,
      );

      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
        );

      const attachments = await queryRunner.query(
        `
        SELECT id, "authorId"
        FROM ${schemaName}."attachment"
        WHERE "authorId" IS NOT NULL
          AND ("createdBySource" IS NULL OR "createdByName" IS NULL)
        `,
      );

      this.logger.log(
        `Found ${attachments.length} attachments to migrate for workspace ${workspaceId}`,
      );

      let migratedCount = 0;

      // Process attachments in batches to avoid memory issues
      const batchSize = 100;

      for (let i = 0; i < attachments.length; i += batchSize) {
        const batch = attachments.slice(i, i + batchSize);

        for (const attachment of batch) {
          const { id, authorId } = attachment;

          if (!isDefined(authorId)) {
            continue;
          }

          // Fetch workspace member details
          const workspaceMember = await workspaceMemberRepository.findOne({
            where: { id: authorId },
          });

          if (!isDefined(workspaceMember)) {
            this.logger.warn(
              `Workspace member ${authorId} not found for attachment ${id}, skipping`,
            );
            continue;
          }

          // Compute display name from workspace member
          const firstName = workspaceMember.name?.firstName || '';
          const lastName = workspaceMember.name?.lastName || '';
          const displayName =
            firstName || lastName
              ? `${firstName} ${lastName}`.trim()
              : 'Unknown';

          // Update attachment with createdBy data
          await queryRunner.query(
            `
            UPDATE ${schemaName}."attachment"
            SET
              "createdBySource" = $1,
              "createdByWorkspaceMemberId" = $2,
              "createdByName" = $3,
              "createdByContext" = $4
            WHERE id = $5
            `,
            [
              FieldActorSource.MANUAL,
              workspaceMember.id,
              displayName,
              JSON.stringify({}),
              id,
            ],
          );

          migratedCount++;
        }
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Successfully migrated ${migratedCount} attachments for workspace ${workspaceId}`,
      );
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Transaction rolled back for workspace ${workspaceId} due to error: ${error.message}`,
        );
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
