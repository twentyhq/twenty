import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
    ActiveOrSuspendedWorkspacesMigrationCommandRunner,
    type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

type TableExistsResult = {
  exists: boolean;
};

type AttachmentAuthorResult = {
  id: string;
  authorId: string | null;
};

@Command({
  name: 'upgrade:1-7:migrate-attachment-author-to-created-by',
  description:
    'Migrate attachment author data to createdBy field and remove author relation',
})
export class MigrateAttachmentAuthorToCreatedByCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    this.logger.log(
      `Migrating attachment author to createdBy for workspace ${workspaceId} in schema ${schemaName}`,
    );

    const attachmentTableExists = (await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
      );
    `)) as TableExistsResult[];

    if (!attachmentTableExists[0]?.exists) {
      this.logger.log(
        `Attachment table does not exist in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const authorIdColumnExists = (await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
        AND column_name = 'authorId'
      );
    `)) as TableExistsResult[];

    if (!authorIdColumnExists[0]?.exists) {
      this.logger.log(
        `AuthorId column does not exist in attachment table for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const createdByColumnExists = (await this.coreDataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = '${schemaName}'
        AND table_name = 'attachment'
        AND column_name = 'createdBy'
      );
    `)) as TableExistsResult[];

    if (!createdByColumnExists[0]?.exists) {
      this.logger.log(
        `CreatedBy column does not exist in attachment table for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    try {
      // Get attachments that have authorId but no createdBy data
      const attachmentsWithAuthor = (await this.coreDataSource.query(`
        SELECT id, "authorId"
        FROM "${schemaName}"."attachment"
        WHERE "authorId" IS NOT NULL
        AND ("createdBy" IS NULL OR "createdBy"::text = '{}');
      `)) as AttachmentAuthorResult[];

      this.logger.log(
        `Found ${attachmentsWithAuthor.length} attachments with author data to migrate in workspace ${workspaceId}`,
      );

      if (attachmentsWithAuthor.length === 0) {
        this.logger.log(
          `No attachments to migrate in workspace ${workspaceId}`,
        );

        return;
      }

      // Migrate author data to createdBy field
      for (const attachment of attachmentsWithAuthor) {
        await this.coreDataSource.query(
          `
          UPDATE "${schemaName}"."attachment"
          SET "createdBy" = jsonb_build_object(
            'source', 'MANUAL',
            'workspaceMemberId', $1,
            'name', COALESCE(
              (SELECT CONCAT(wm."nameFirstName", ' ', wm."nameLastName")
               FROM "${schemaName}"."workspaceMember" wm
               WHERE wm.id = $1),
              'Unknown User'
            )
          )
          WHERE id = $2;
        `,
          [attachment.authorId, attachment.id],
        );
      }

      this.logger.log(
        `Successfully migrated ${attachmentsWithAuthor.length} attachment author records to createdBy in workspace ${workspaceId}`,
      );

      // Get final count to verify migration
      const migratedCount = (await this.coreDataSource.query(`
        SELECT COUNT(*) as count
        FROM "${schemaName}"."attachment"
        WHERE "createdBy" IS NOT NULL
        AND "createdBy"::text != '{}';
      `)) as [{ count: string }];

      this.logger.log(
        `Total attachments with createdBy data after migration: ${migratedCount[0].count} in workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to migrate attachment author to createdBy for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }
}
