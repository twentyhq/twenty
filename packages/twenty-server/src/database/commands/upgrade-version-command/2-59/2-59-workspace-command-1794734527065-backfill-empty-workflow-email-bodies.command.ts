import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const SERIALIZED_EMPTY_EMAIL_DOCUMENT = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [{ type: 'paragraph' }],
});

const IS_BLANK_EMAIL_STEP_BODY = `step->>'type' IN ('SEND_EMAIL', 'DRAFT_EMAIL') AND step #>> '{settings,input,body}' ~ '^\\s*$'`;

const HAS_BLANK_EMAIL_STEP_BODY = `jsonb_typeof(steps) = 'array' AND EXISTS (
  SELECT 1 FROM jsonb_array_elements(steps) AS element(step) WHERE ${IS_BLANK_EMAIL_STEP_BODY})`;

@RegisteredWorkspaceCommand('2.59.0', 1794734527065)
@Command({
  name: 'upgrade:2-59:backfill-empty-workflow-email-bodies',
  description:
    'Store an empty email document as the body of workflow send/draft email steps whose body is a blank string',
})
export class BackfillEmptyWorkflowEmailBodiesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const workspaceVersionTable = `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`;
    const [{ hasWorkspaceVersionTable }] = await dataSource.query(
      `SELECT to_regclass($1) IS NOT NULL AS "hasWorkspaceVersionTable"`,
      [workspaceVersionTable],
    );
    const tables = [
      {
        name: 'core."workflowVersion"',
        where: `"workspaceId" = $1 AND ${HAS_BLANK_EMAIL_STEP_BODY}`,
        parameters: [workspaceId],
      },
      ...(hasWorkspaceVersionTable
        ? [
            {
              name: workspaceVersionTable,
              where: HAS_BLANK_EMAIL_STEP_BODY,
              parameters: [],
            },
          ]
        : []),
    ];

    for (const { name, where, parameters } of tables) {
      if (options.dryRun) {
        const [{ count }] = await dataSource.query(
          `SELECT count(*) FROM ${name} WHERE ${where}`,
          parameters,
        );

        this.logger.log(
          `[DRY RUN] Would backfill empty email bodies in ${count} row(s) of ${name} for workspace ${workspaceId}`,
        );

        continue;
      }

      await dataSource.query(
        `UPDATE ${name} SET steps = (
          SELECT jsonb_agg(
            CASE WHEN ${IS_BLANK_EMAIL_STEP_BODY}
              THEN jsonb_set(step, '{settings,input,body}', to_jsonb('${SERIALIZED_EMPTY_EMAIL_DOCUMENT}'::text))
              ELSE step END
            ORDER BY position)
          FROM jsonb_array_elements(steps) WITH ORDINALITY AS element(step, position))
        WHERE ${where}`,
        parameters,
      );
    }

    if (!options.dryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }
  }
}
