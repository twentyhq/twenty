import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { convertWorkflowEmailBodiesToEmailDocuments } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-workflow-email-bodies-to-email-documents.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type WorkflowVersionStepsRow = {
  id: string;
  steps: WorkflowAction[] | null;
};

const convertEmailBodiesInRows = (
  rows: WorkflowVersionStepsRow[],
): WorkflowVersionStepsRow[] =>
  rows.flatMap(({ id, steps }) => {
    const { value, hasChanged } =
      convertWorkflowEmailBodiesToEmailDocuments(steps);

    return hasChanged ? [{ id, steps: value }] : [];
  });

@RegisteredWorkspaceCommand('2.46.0', 1791209963000)
@Command({
  name: 'upgrade:2-46:convert-workflow-email-bodies-to-email-documents',
  description:
    'Store HTML, plain text and versionless email bodies of workflow send/draft email steps as canonical email documents, rendering exactly as before',
})
export class ConvertWorkflowEmailBodiesToEmailDocumentsCommand extends ProvisionedWorkspaceCommandRunner {
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
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping email body conversion`,
      );

      return;
    }

    const workspaceVersionTable = `"${getWorkspaceSchemaName(workspaceId)}"."workflowVersion"`;
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const convertedCoreVersions = convertEmailBodiesInRows(
        await queryRunner.query(
          `SELECT id, steps FROM core."workflowVersion" WHERE "workspaceId" = $1`,
          [workspaceId],
        ),
      );
      const [{ hasWorkspaceVersionTable }] = await queryRunner.query(
        `SELECT to_regclass($1) IS NOT NULL AS "hasWorkspaceVersionTable"`,
        [workspaceVersionTable],
      );
      const convertedWorkspaceVersions = hasWorkspaceVersionTable
        ? convertEmailBodiesInRows(
            await queryRunner.query(
              `SELECT id, steps FROM ${workspaceVersionTable}`,
            ),
          )
        : [];

      if (
        convertedCoreVersions.length === 0 &&
        convertedWorkspaceVersions.length === 0
      ) {
        return;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would convert email bodies in ${convertedCoreVersions.length} core and ${convertedWorkspaceVersions.length} workspace workflow version(s) for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.startTransaction();

      await this.updateSteps(
        queryRunner,
        'core."workflowVersion"',
        convertedCoreVersions,
      );
      await this.updateSteps(
        queryRunner,
        workspaceVersionTable,
        convertedWorkspaceVersions,
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowVersionMaps',
    ]);

    this.logger.log(
      `Converted workflow email bodies to email documents for workspace ${workspaceId}`,
    );
  }

  private async updateSteps(
    queryRunner: QueryRunner,
    tableName: string,
    convertedVersions: WorkflowVersionStepsRow[],
  ): Promise<void> {
    for (const { id, steps } of convertedVersions) {
      await queryRunner.query(
        `UPDATE ${tableName} SET steps = $1::jsonb WHERE id = $2`,
        [JSON.stringify(steps), id],
      );
    }
  }
}
