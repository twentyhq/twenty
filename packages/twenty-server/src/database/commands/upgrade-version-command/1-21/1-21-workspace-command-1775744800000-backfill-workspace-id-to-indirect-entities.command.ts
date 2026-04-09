import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

type BackfillDefinition = {
  table: string;
  parentTable: string;
  foreignKey: string;
  billingOnly?: boolean;
};

const BACKFILL_DEFINITIONS: BackfillDefinition[] = [
  { table: 'agentChatThread', parentTable: 'userWorkspace', foreignKey: 'userWorkspaceId' },
  { table: 'agentTurn', parentTable: 'agentChatThread', foreignKey: 'threadId' },
  { table: 'agentMessage', parentTable: 'agentChatThread', foreignKey: 'threadId' },
  { table: 'agentTurnEvaluation', parentTable: 'agentTurn', foreignKey: 'turnId' },
  { table: 'agentMessagePart', parentTable: 'agentMessage', foreignKey: 'messageId' },
  { table: 'indexFieldMetadata', parentTable: 'indexMetadata', foreignKey: 'indexMetadataId' },
  { table: 'applicationVariable', parentTable: 'application', foreignKey: 'applicationId' },
  { table: 'billingSubscriptionItem', parentTable: 'billingSubscription', foreignKey: 'billingSubscriptionId', billingOnly: true },
];

@RegisteredWorkspaceCommand('1.21.0', 1775744800000)
@Command({
  name: 'upgrade:1-21:backfill-workspace-id-to-indirect-entities',
  description:
    'Backfill workspaceId on agent, index field, application variable, and billing subscription item tables',
})
export class BackfillWorkspaceIdToIndirectEntitiesCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly twentyConfigService: TwentyConfigService,
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isBillingEnabled = this.twentyConfigService.get('IS_BILLING_ENABLED');

    for (const { table, parentTable, foreignKey, billingOnly } of BACKFILL_DEFINITIONS) {
      if (billingOnly && !isBillingEnabled) continue;

      const result = await this.dataSource.query(
        `UPDATE "core"."${table}" t
            SET "workspaceId" = p."workspaceId"
           FROM "core"."${parentTable}" p
          WHERE t."${foreignKey}" = p."id"
            AND t."workspaceId" IS NULL
            AND p."workspaceId" = $1`,
        [workspaceId],
      );

      if (result[1] > 0) {
        this.logger.log(
          `  Backfilled ${result[1]} ${table} rows for workspace ${workspaceId}`,
        );
      }
    }
  }
}
