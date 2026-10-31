import { Command } from 'nest-commander';
import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildAiRunScopeFromStepAgentRole,
  type StepAgentRole,
  type StepAgentRoleFieldPermission,
  type StepAgentRoleObjectPermission,
} from 'src/database/commands/upgrade-version-command/2-55/utils/build-ai-run-scope-from-step-agent-role.util';
import { inlinePausedAgentRunSpec } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-paused-agent-run-spec.util';
import {
  inlineWorkflowStepAgents,
  normalizeStepModelConfiguration,
  type StepAgentInlineConfig,
} from 'src/database/commands/upgrade-version-command/2-55/utils/inline-workflow-step-agents.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const REWRITE_BATCH_SIZE = 100;
const AGENT_DELETE_BATCH_SIZE = 100;

// Runs that can still reach a step; a finished run is only read
const NON_TERMINAL_WORKFLOW_RUN_STATUSES = ['NOT_STARTED', 'ENQUEUED', 'RUNNING'];

type StoredJsonbRow = { id: string; value: unknown };

type StepAgentRow = {
  id: string;
  prompt: string;
  modelId: string;
  modelConfiguration: Parameters<typeof normalizeStepModelConfiguration>[0];
  responseFormat: AgentResponseFormat | null;
  applicationId: string;
  roleId: string | null;
};

type StepAgentRoleRow = Omit<
  StepAgentRole,
  | 'objectPermissions'
  | 'fieldPermissions'
  | 'permissionFlagUniversalIdentifiers'
> & {
  id: string;
  hasRowLevelPermissionPredicates: boolean;
};

type StepAgents = {
  inlineConfigByAgentId: Map<string, StepAgentInlineConfig>;
  applicationIdByAgentId: Map<string, string>;
  // agents whose role a scope cannot express, which keep running as agents
  keptAgentIds: Set<string>;
  roleIdByAgentId: Map<string, string>;
};

type RewriteCounts = {
  coreWorkflowVersionCount: number;
  workflowVersionCount: number;
  workflowRunCount: number;
  pendingWakeUpCount: number;
};

// Every AI step of a workflow built in the builder ran a hidden agent of the workspace custom
// application. The step now carries that agent's prompt, model and permissions itself, so the
// agents and their agent-only roles go. See the "AI runs without hidden agents" design doc
@RegisteredWorkspaceCommand('2.55.0', 1793446972324)
@Command({
  name: 'upgrade:2-55:inline-workflow-step-agents',
  description:
    'Move the prompt, model and permissions of the hidden agent behind each AI workflow step into the step, then delete those agents',
})
export class InlineWorkflowStepAgentsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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
        `No data source for workspace ${workspaceId}, skipping workflow step agents`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const stepAgents = await this.loadStepAgents({ dataSource, workspaceId });

    if (
      stepAgents.inlineConfigByAgentId.size === 0 &&
      stepAgents.keptAgentIds.size === 0
    ) {
      return;
    }

    const workflowTables = await this.findWorkflowTables({
      dataSource,
      workspaceId,
    });
    const counts = await this.rewriteReferences({
      dataSource,
      workspaceId,
      isDryRun,
      stepAgents,
      workflowTables,
    });

    const referencedAgentIds = await this.findReferencedAgentIds({
      dataSource,
      workspaceId,
      workflowTables,
    });
    const orphanAgentIds = [...stepAgents.inlineConfigByAgentId.keys()].filter(
      (agentId) => !referencedAgentIds.has(agentId),
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would inline the agents of ${counts.coreWorkflowVersionCount} core workflow version(s), ${counts.workflowVersionCount} workflow version(s), ${counts.workflowRunCount} workflow run(s) and ${counts.pendingWakeUpCount} paused run(s), then delete step agents, ${orphanAgentIds.length} of which are already unreferenced`,
      );

      return;
    }

    await this.deleteStepAgents({ workspaceId, agentIds: orphanAgentIds });

    const deletedRoleCount = await this.deleteUnusedAgentOnlyRoles({
      dataSource,
      workspaceId,
      roleIds: orphanAgentIds
        .map((agentId) => stepAgents.roleIdByAgentId.get(agentId))
        .filter(isDefined),
    });

    if (counts.coreWorkflowVersionCount > 0 || deletedRoleCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
        'flatObjectPermissionMaps',
        'flatFieldPermissionMaps',
        'rolesPermissions',
      ]);
    }

    this.logger.log(
      `Workspace ${workspaceId}: inlined the agents of ${counts.coreWorkflowVersionCount} core workflow version(s), ${counts.workflowVersionCount} workflow version(s), ${counts.workflowRunCount} workflow run(s) and ${counts.pendingWakeUpCount} paused run(s); deleted ${orphanAgentIds.length} agent(s) and ${deletedRoleCount} agent-only role(s)`,
    );
  }

  private async loadStepAgents({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<StepAgents> {
    // Only builder steps create system agents in the custom application; an installed
    // application's system agents are its own and stay
    const agentRows: StepAgentRow[] = await dataSource.query(
      `SELECT agent.id, agent.prompt, agent."modelId", agent."modelConfiguration",
         agent."responseFormat", agent."applicationId", target."roleId"
       FROM core."agent" agent
       JOIN core."workspace" workspace ON workspace.id = agent."workspaceId"
       LEFT JOIN core."roleTarget" target ON target."agentId" = agent.id
       WHERE agent."workspaceId" = $1
         AND agent."isSystem" = true
         AND agent."applicationId" = workspace."workspaceCustomApplicationId"
         AND COALESCE(jsonb_array_length(agent.triggers), 0) = 0`,
      [workspaceId],
    );

    const roleIds = [
      ...new Set(agentRows.map(({ roleId }) => roleId).filter(isDefined)),
    ];
    const scopeByRoleId = await this.loadRoleScopes({
      dataSource,
      roleIds,
    });

    const stepAgents: StepAgents = {
      inlineConfigByAgentId: new Map(),
      applicationIdByAgentId: new Map(),
      keptAgentIds: new Set(),
      roleIdByAgentId: new Map(),
    };

    for (const agentRow of agentRows) {
      stepAgents.applicationIdByAgentId.set(agentRow.id, agentRow.applicationId);

      if (isDefined(agentRow.roleId)) {
        stepAgents.roleIdByAgentId.set(agentRow.id, agentRow.roleId);
      }

      const scope = isDefined(agentRow.roleId)
        ? scopeByRoleId.get(agentRow.roleId)
        : null;

      if (scope === undefined) {
        stepAgents.keptAgentIds.add(agentRow.id);
        continue;
      }

      stepAgents.inlineConfigByAgentId.set(agentRow.id, {
        instructions: agentRow.prompt,
        modelId: agentRow.modelId,
        modelConfiguration: normalizeStepModelConfiguration(
          agentRow.modelConfiguration,
        ),
        responseFormat: agentRow.responseFormat,
        scope,
      });
    }

    return stepAgents;
  }

  // A role with row-level predicates has no scope: it is left out, so its agents are kept
  private async loadRoleScopes({
    dataSource,
    roleIds,
  }: {
    dataSource: DataSource;
    roleIds: string[];
  }): Promise<Map<string, AiRunScope>> {
    if (roleIds.length === 0) {
      return new Map();
    }

    const [roleRows, objectPermissionRows, fieldPermissionRows, flagRows]: [
      StepAgentRoleRow[],
      (StepAgentRoleObjectPermission & { roleId: string })[],
      (StepAgentRoleFieldPermission & { roleId: string })[],
      { roleId: string; universalIdentifier: string }[],
    ] = await Promise.all([
      dataSource.query(
        `SELECT role.id, role."canReadAllObjectRecords", role."canUpdateAllObjectRecords",
           role."canSoftDeleteAllObjectRecords", role."canDestroyAllObjectRecords",
           role."canUpdateAllSettings", role."canAccessAllTools",
           EXISTS (
             SELECT 1 FROM core."rowLevelPermissionPredicate" predicate
             WHERE predicate."roleId" = role.id AND predicate."deletedAt" IS NULL
           ) AS "hasRowLevelPermissionPredicates"
         FROM core."role" role
         WHERE role.id = ANY($1::uuid[])`,
        [roleIds],
      ),
      dataSource.query(
        `SELECT permission."roleId", object."universalIdentifier" AS "objectUniversalIdentifier",
           permission."canReadObjectRecords", permission."canUpdateObjectRecords",
           permission."canSoftDeleteObjectRecords", permission."canDestroyObjectRecords"
         FROM core."objectPermission" permission
         JOIN core."objectMetadata" object ON object.id = permission."objectMetadataId"
         WHERE permission."roleId" = ANY($1::uuid[])`,
        [roleIds],
      ),
      dataSource.query(
        `SELECT permission."roleId", object."universalIdentifier" AS "objectUniversalIdentifier",
           field."universalIdentifier" AS "fieldUniversalIdentifier",
           permission."canReadFieldValue", permission."canUpdateFieldValue"
         FROM core."fieldPermission" permission
         JOIN core."objectMetadata" object ON object.id = permission."objectMetadataId"
         JOIN core."fieldMetadata" field ON field.id = permission."fieldMetadataId"
         WHERE permission."roleId" = ANY($1::uuid[])`,
        [roleIds],
      ),
      dataSource.query(
        `SELECT role_flag."roleId", flag."universalIdentifier"
         FROM core."rolePermissionFlag" role_flag
         JOIN core."permissionFlag" flag ON flag.id = role_flag."permissionFlagId"
         WHERE role_flag."roleId" = ANY($1::uuid[])`,
        [roleIds],
      ),
    ]);

    return new Map(
      roleRows
        .filter(
          ({ hasRowLevelPermissionPredicates }) =>
            !hasRowLevelPermissionPredicates,
        )
        .map(({ id, hasRowLevelPermissionPredicates: _, ...role }) => [
          id,
          buildAiRunScopeFromStepAgentRole({
            ...role,
            objectPermissions: objectPermissionRows
              .filter(({ roleId }) => roleId === id)
              .map(({ roleId: _roleId, ...permission }) => permission),
            fieldPermissions: fieldPermissionRows
              .filter(({ roleId }) => roleId === id)
              .map(({ roleId: _roleId, ...permission }) => permission),
            permissionFlagUniversalIdentifiers: flagRows
              .filter(({ roleId }) => roleId === id)
              .map(({ universalIdentifier }) => universalIdentifier),
          }),
        ]),
    );
  }

  private async findWorkflowTables({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<{ workflowVersion: string | null; workflowRun: string | null }> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const findTable = async (
      universalIdentifier: string,
      tableName: string,
    ): Promise<string | null> => {
      if (
        !isDefined(
          flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier],
        )
      ) {
        return null;
      }

      const [table]: { name: string | null }[] = await dataSource.query(
        'SELECT to_regclass($1) AS name',
        [`${schema}."${tableName}"`],
      );

      return isDefined(table?.name) ? `${schema}."${tableName}"` : null;
    };

    return {
      workflowVersion: await findTable(
        STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        'workflowVersion',
      ),
      workflowRun: await findTable(
        STANDARD_OBJECTS.workflowRun.universalIdentifier,
        'workflowRun',
      ),
    };
  }

  private async rewriteReferences({
    dataSource,
    workspaceId,
    isDryRun,
    stepAgents,
    workflowTables,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    isDryRun: boolean;
    stepAgents: StepAgents;
    workflowTables: { workflowVersion: string | null; workflowRun: string | null };
  }): Promise<RewriteCounts> {
    const { inlineConfigByAgentId, keptAgentIds, applicationIdByAgentId } =
      stepAgents;
    const inlineSteps = (tableName: string, rowId: string, steps: unknown) => {
      const result = inlineWorkflowStepAgents({
        steps,
        inlineConfigByAgentId,
        keptAgentIds,
      });

      for (const keptStepId of result.keptStepIds) {
        this.logger.warn(
          `Workspace ${workspaceId}: step ${keptStepId} of ${tableName} ${rowId} keeps its agent, whose role has row-level predicates a step scope cannot express`,
        );
      }

      return { value: result.steps, hasChanged: result.hasChanged };
    };

    const coreWorkflowVersionCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"AI_AGENT"}]'`,
      whereParameters: [workspaceId],
      mapRow: ({ id, value }) => inlineSteps('core workflow version', id, value),
    });

    const workflowVersionCount = isDefined(workflowTables.workflowVersion)
      ? await this.rewriteRows({
          dataSource,
          isDryRun,
          tableName: workflowTables.workflowVersion,
          columnName: 'steps',
          whereClause: `steps @> '[{"type":"AI_AGENT"}]'`,
          whereParameters: [],
          mapRow: ({ id, value }) => inlineSteps('workflow version', id, value),
        })
      : 0;

    const workflowRunCount = isDefined(workflowTables.workflowRun)
      ? await this.rewriteRows({
          dataSource,
          isDryRun,
          tableName: workflowTables.workflowRun,
          columnName: 'state',
          whereClause: `status::text = ANY($1::text[]) AND state -> 'flow' -> 'steps' @> '[{"type":"AI_AGENT"}]'`,
          whereParameters: [NON_TERMINAL_WORKFLOW_RUN_STATUSES],
          mapRow: ({ id, value }) => {
            const state = value as { flow: { steps: unknown } };
            const { value: steps, hasChanged } = inlineSteps(
              'workflow run',
              id,
              state.flow.steps,
            );

            return {
              value: { ...state, flow: { ...state.flow, steps } },
              hasChanged,
            };
          },
        })
      : 0;

    const pendingWakeUpCount = await this.rewriteRows({
      dataSource,
      isDryRun,
      tableName: 'core."pendingWakeUp"',
      columnName: 'payload',
      whereClause: `"workspaceId" = $1 AND "ownerType" = 'AGENT_RUN' AND payload -> 'caller' ->> 'type' = 'WORKFLOW_STEP' AND payload -> 'runSpec' ->> 'agentId' = ANY($2::text[])`,
      whereParameters: [workspaceId, [...inlineConfigByAgentId.keys()]],
      mapRow: ({ value }) => {
        const payload = value as {
          caller: { ref: { stepId: string } };
          runSpec: { agentId: string } & Record<string, unknown>;
        };
        const agentId = payload.runSpec.agentId;
        const inlineConfig = inlineConfigByAgentId.get(agentId);

        if (!isDefined(inlineConfig)) {
          return { value, hasChanged: false };
        }

        return {
          value: {
            ...payload,
            runSpec: inlinePausedAgentRunSpec({
              runSpec: payload.runSpec,
              inlineConfig,
              applicationId: applicationIdByAgentId.get(agentId) ?? null,
              stepId: payload.caller.ref.stepId,
            }),
          },
          hasChanged: true,
        };
      },
    });

    return {
      coreWorkflowVersionCount,
      workflowVersionCount,
      workflowRunCount,
      pendingWakeUpCount,
    };
  }

  // Finished runs are left out: they only show what ran, and a deleted agent shows as missing there
  private async findReferencedAgentIds({
    dataSource,
    workspaceId,
    workflowTables,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    workflowTables: { workflowVersion: string | null; workflowRun: string | null };
  }): Promise<Set<string>> {
    const stepAgentIdsOf = (stepsExpression: string, fromClause: string) =>
      `SELECT step -> 'settings' -> 'input' ->> 'agentId' AS "agentId"
       FROM ${fromClause}
       CROSS JOIN LATERAL jsonb_array_elements(
         CASE WHEN jsonb_typeof(${stepsExpression}) = 'array' THEN ${stepsExpression} ELSE '[]'::jsonb END
       ) step
       WHERE step ->> 'type' = 'AI_AGENT'`;

    const queries = [
      `${stepAgentIdsOf('version.steps', 'core."workflowVersion" version')} AND version."workspaceId" = $1`,
      `SELECT payload -> 'runSpec' ->> 'agentId' AS "agentId" FROM core."pendingWakeUp" WHERE "workspaceId" = $1`,
      ...(isDefined(workflowTables.workflowVersion)
        ? [stepAgentIdsOf('version.steps', `${workflowTables.workflowVersion} version`)]
        : []),
      ...(isDefined(workflowTables.workflowRun)
        ? [
            `${stepAgentIdsOf(`run.state -> 'flow' -> 'steps'`, `${workflowTables.workflowRun} run`)} AND run.status::text = ANY($2::text[])`,
          ]
        : []),
    ];

    const rows: { agentId: string | null }[] = await dataSource.query(
      queries.join(' UNION '),
      isDefined(workflowTables.workflowRun)
        ? [workspaceId, NON_TERMINAL_WORKFLOW_RUN_STATUSES]
        : [workspaceId],
    );

    return new Set(rows.map(({ agentId }) => agentId).filter(isDefined));
  }

  private async deleteStepAgents({
    workspaceId,
    agentIds,
  }: {
    workspaceId: string;
    agentIds: string[];
  }): Promise<void> {
    if (agentIds.length === 0) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    for (
      let batchStart = 0;
      batchStart < agentIds.length;
      batchStart += AGENT_DELETE_BATCH_SIZE
    ) {
      const { flatAgentMaps, flatRoleTargetByAgentIdMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatAgentMaps',
          'flatRoleTargetByAgentIdMaps',
        ]);
      const flatAgentsToDelete = agentIds
        .slice(batchStart, batchStart + AGENT_DELETE_BATCH_SIZE)
        .map((agentId) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: agentId,
            flatEntityMaps: flatAgentMaps,
          }),
        )
        .filter(isDefined);

      if (flatAgentsToDelete.length === 0) {
        continue;
      }

      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              agent: {
                flatEntityToCreate: [],
                flatEntityToDelete: flatAgentsToDelete,
                flatEntityToUpdate: [],
              },
              roleTarget: {
                flatEntityToCreate: [],
                flatEntityToDelete: flatAgentsToDelete
                  .map(({ id }) => flatRoleTargetByAgentIdMaps[id])
                  .filter(isDefined),
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          `Failed to delete workflow step agents in workspace ${workspaceId}`,
        );
      }
    }
  }

  // Only a role made for these agents goes: agent-only, owned by the custom application, no longer
  // assigned to anything and no application's default role. Its permissions go with it
  private async deleteUnusedAgentOnlyRoles({
    dataSource,
    workspaceId,
    roleIds,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    roleIds: string[];
  }): Promise<number> {
    if (roleIds.length === 0) {
      return 0;
    }

    const deletedRoles: [{ id: string }[], number] = await dataSource.query(
      `DELETE FROM core."role" role
       USING core."workspace" workspace
       WHERE workspace.id = role."workspaceId"
         AND role."workspaceId" = $1
         AND role.id = ANY($2::uuid[])
         AND role."applicationId" = workspace."workspaceCustomApplicationId"
         AND role."universalIdentifier" <> $3
         AND role."canBeAssignedToAgents" = true
         AND role."canBeAssignedToUsers" = false
         AND role."canBeAssignedToApiKeys" = false
         AND NOT EXISTS (SELECT 1 FROM core."roleTarget" target WHERE target."roleId" = role.id)
         AND NOT EXISTS (SELECT 1 FROM core."application" application WHERE application."defaultRoleId" = role.id)
       RETURNING role.id`,
      [workspaceId, [...new Set(roleIds)], MEMBER_ROLE_UNIVERSAL_IDENTIFIER],
    );

    return deletedRoles[0].length;
  }

  private async rewriteRows({
    dataSource,
    isDryRun,
    tableName,
    columnName,
    whereClause,
    whereParameters,
    mapRow,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    tableName: string;
    columnName: string;
    whereClause: string;
    whereParameters: unknown[];
    mapRow: (row: StoredJsonbRow) => { value: unknown; hasChanged: boolean };
  }): Promise<number> {
    let rewrittenRowCount = 0;
    let afterRowId: string | undefined;

    while (true) {
      const parameters = isDefined(afterRowId)
        ? [...whereParameters, afterRowId]
        : whereParameters;

      const rows: StoredJsonbRow[] = await dataSource.query(
        `SELECT id, ${columnName} AS value FROM ${tableName} WHERE (${whereClause})${isDefined(afterRowId) ? ` AND id > $${parameters.length}` : ''} ORDER BY id LIMIT ${REWRITE_BATCH_SIZE}`,
        parameters,
      );

      const rewrites = rows.flatMap((row) => {
        const { value, hasChanged } = mapRow(row);

        return hasChanged ? [{ id: row.id, from: row.value, to: value }] : [];
      });

      if (isDryRun) {
        rewrittenRowCount += rewrites.length;
      } else if (rewrites.length > 0) {
        // Compare-and-set so a row edited since it was read is left as is
        const [, updatedRowCount]: [unknown, number] = await dataSource.query(
          `UPDATE ${tableName} AS target SET ${columnName} = rewrite."to" FROM jsonb_to_recordset($1::jsonb) AS rewrite(id uuid, "from" jsonb, "to" jsonb) WHERE target.id = rewrite.id AND target.${columnName} = rewrite."from"`,
          [JSON.stringify(rewrites)],
        );

        rewrittenRowCount += updatedRowCount;
      }

      if (rows.length < REWRITE_BATCH_SIZE) {
        return rewrittenRowCount;
      }

      afterRowId = rows[rows.length - 1].id;
    }
  }
}
