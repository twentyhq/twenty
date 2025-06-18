import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
@Command({
  name: 'upgrade:0-54:transfer-webhook-to-core',
  description: 'Transfer webhook data from workspace schemas to core schema',
})
export class TransferWebhookToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running webhook transfer for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.transferWebhookData({
      workspaceId,
      dataSource,
      dryRun: !!options.dryRun,
    });
  }

  private async transferWebhookData({
    workspaceId,
    dataSource,
    dryRun,
  }: {
    workspaceId: string;
    dataSource: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    dryRun: boolean;
  }) {
    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    // Check if webhook table exists in workspace schema
    const tableExists = await dataSource.query(
      `SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = 'webhook'
      )`,
      [schemaName],
      undefined, // queryRunner
      {
        shouldBypassPermissionChecks: true,
      },
    );

    if (!tableExists[0].exists) {
      this.logger.log(`No webhook table found in workspace ${workspaceId}`);

      return;
    }

    // Get webhook count for logging
    const webhookCount = await dataSource.query(
      `SELECT COUNT(*) as count FROM "${schemaName}"."webhook"`,
      undefined, // parameters
      undefined, // queryRunner
      {
        shouldBypassPermissionChecks: true,
      },
    );

    this.logger.log(
      `Found ${webhookCount[0].count} webhooks in workspace ${workspaceId}`,
    );

    if (webhookCount[0].count === 0) {
      this.logger.log(`No webhooks to transfer for workspace ${workspaceId}`);

      if (!dryRun) {
        // Drop empty table
        await dataSource.query(
          `DROP TABLE "${schemaName}"."webhook"`,
          undefined, // parameters
          undefined, // queryRunner
          {
            shouldBypassPermissionChecks: true,
          },
        );
        this.logger.log(
          `Dropped empty webhook table for workspace ${workspaceId}`,
        );
      }

      return;
    }

    if (!dryRun) {
      // Transfer data to core schema
      await dataSource.query(
        `
        INSERT INTO "core"."webhook" 
        ("id", "targetUrl", "operations", "description", "secret", "workspaceId", "createdAt", "updatedAt", "deletedAt")
        SELECT 
          "id", 
          "targetUrl", 
          "operations", 
          "description", 
          "secret", 
          $1::uuid,
          "createdAt", 
          "updatedAt", 
          "deletedAt"
        FROM "${schemaName}"."webhook"
        ON CONFLICT ("id") DO NOTHING
      `,
        [workspaceId],
        undefined, // queryRunner
        {
          shouldBypassPermissionChecks: true,
        },
      );

      // Drop the workspace table
      await dataSource.query(
        `DROP TABLE "${schemaName}"."webhook"`,
        undefined, // parameters
        undefined, // queryRunner
        {
          shouldBypassPermissionChecks: true,
        },
      );

      this.logger.log(
        `Successfully transferred ${webhookCount[0].count} webhooks from workspace ${workspaceId} to core schema`,
      );
    } else {
      this.logger.log(
        `[DRY RUN] Would transfer ${webhookCount[0].count} webhooks from workspace ${workspaceId} to core schema`,
      );
    }
  }
}
