import { Command } from 'nest-commander';
import { type AgentResponseFormat, type AiRunScope } from 'twenty-shared/ai';
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
import { inlineWorkflowStepAgents } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-workflow-step-agents.util';
import {
  normalizeStepModelConfiguration,
  type StoredModelConfiguration,
} from 'src/database/commands/upgrade-version-command/2-55/utils/normalize-step-model-configuration.util';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-55/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// a failed run can be retried from its saved steps
const WORKFLOW_RUN_STATUSES_THAT_CAN_RUN_A_STEP = [
  'NOT_STARTED',
  'ENQUEUED',
  'RUNNING',
  'FAILED',
];

type StepAgentRow = {
  id: string;
  prompt: string;
  modelId: string;
  modelConfiguration: StoredModelConfiguration;
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
  // their role's row-level predicates have no scope equivalent, so their steps keep them
  keptAgentIds: Set<string>;
};

type WorkflowTables = {
  workflowVersion: string | null;
  workflowRun: string | null;
};

type StoredWakeUpPayload = {
  caller: { ref: { stepId: string } };
  runSpec: { agentId: string | null } & Record<string, unknown>;
};

// Moves each builder AI step's hidden agent into the step; deleting the agents is a later command
@RegisteredWorkspaceCommand('2.55.0', 1793446972324)
@Command({
  name: 'upgrade:2-55:inline-workflow-step-agents',
  description:
    'Move the prompt, model and permissions of the hidden agent behind each AI workflow step into the step',
})
export class InlineWorkflowStepAgentsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const inlineSteps = ({
      tableName,
      rowId,
      steps,
    }: {
      tableName: string;
      rowId: string;
      steps: StoredWorkflowStep[];
    }) => {
      if (!Array.isArray(steps)) {
        return { value: steps, hasChanged: false };
      }

      const result = inlineWorkflowStepAgents({
        steps,
        inlineConfigByAgentId: stepAgents.inlineConfigByAgentId,
        keptAgentIds: stepAgents.keptAgentIds,
      });

      for (const keptStepId of result.keptStepIds) {
        this.logger.warn(
          `Workspace ${workspaceId}: step ${keptStepId} of ${tableName} ${rowId} keeps its agent, whose role has row-level predicates a step scope cannot express`,
        );
      }

      return { value: result.steps, hasChanged: result.hasChanged };
    };

    const coreWorkflowVersionCount =
      await rewriteJsonbRowsWithCompareAndSet<StoredWorkflowStep[]>({
        dataSource,
        isDryRun,
        tableName: 'core."workflowVersion"',
        columnName: 'steps',
        whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"AI_AGENT"}]'`,
        whereParameters: [workspaceId],
        mapRow: ({ id, value }) =>
          inlineSteps({
            tableName: 'core workflow version',
            rowId: id,
            steps: value,
          }),
      });

    const workflowVersionCount = isDefined(workflowTables.workflowVersion)
      ? await rewriteJsonbRowsWithCompareAndSet<StoredWorkflowStep[]>({
          dataSource,
          isDryRun,
          tableName: workflowTables.workflowVersion,
          columnName: 'steps',
          whereClause: `steps @> '[{"type":"AI_AGENT"}]'`,
          whereParameters: [],
          mapRow: ({ id, value }) =>
            inlineSteps({
              tableName: 'workflow version',
              rowId: id,
              steps: value,
            }),
        })
      : 0;

    const workflowRunCount = isDefined(workflowTables.workflowRun)
      ? await rewriteJsonbRowsWithCompareAndSet<{
          flow: { steps: StoredWorkflowStep[] };
        }>({
          dataSource,
          isDryRun,
          tableName: workflowTables.workflowRun,
          columnName: 'state',
          whereClause: `status::text = ANY($1::text[]) AND state -> 'flow' -> 'steps' @> '[{"type":"AI_AGENT"}]'`,
          whereParameters: [WORKFLOW_RUN_STATUSES_THAT_CAN_RUN_A_STEP],
          mapRow: ({ id, value: state }) => {
            const { value: steps, hasChanged } = inlineSteps({
              tableName: 'workflow run',
              rowId: id,
              steps: state.flow.steps,
            });

            return {
              value: { ...state, flow: { ...state.flow, steps } },
              hasChanged,
            };
          },
        })
      : 0;

    const pendingWakeUpCount =
      await rewriteJsonbRowsWithCompareAndSet<StoredWakeUpPayload>({
        dataSource,
        isDryRun,
        tableName: 'core."pendingWakeUp"',
        columnName: 'payload',
        whereClause: `"workspaceId" = $1 AND "ownerType" = 'AGENT_RUN' AND payload -> 'caller' ->> 'type' = 'WORKFLOW_STEP' AND payload -> 'runSpec' ->> 'agentId' = ANY($2::text[])`,
        whereParameters: [
          workspaceId,
          [...stepAgents.inlineConfigByAgentId.keys()],
        ],
        mapRow: ({ value: payload }) => {
          const agentId = payload.runSpec.agentId;
          const inlineConfig = isDefined(agentId)
            ? stepAgents.inlineConfigByAgentId.get(agentId)
            : undefined;

          if (!isDefined(agentId) || !isDefined(inlineConfig)) {
            return { value: payload, hasChanged: false };
          }

          return {
            value: {
              ...payload,
              runSpec: inlinePausedAgentRunSpec({
                runSpec: payload.runSpec,
                inlineConfig,
                applicationId:
                  stepAgents.applicationIdByAgentId.get(agentId) ?? null,
                stepId: payload.caller.ref.stepId,
              }),
            },
            hasChanged: true,
          };
        },
      });

    if (!isDryRun && coreWorkflowVersionCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: inlined the agents of ${coreWorkflowVersionCount} core workflow version(s), ${workflowVersionCount} workflow version(s), ${workflowRunCount} workflow run(s) and ${pendingWakeUpCount} paused run(s)`,
    );
  }

  private async loadStepAgents({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<StepAgents> {
    // only builder steps create system agents in the custom application; an installed app's are its own
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

    const scopeByRoleId = await this.loadRoleScopes({
      dataSource,
      roleIds: [
        ...new Set(agentRows.map(({ roleId }) => roleId).filter(isDefined)),
      ],
    });

    const stepAgents: StepAgents = {
      inlineConfigByAgentId: new Map(),
      applicationIdByAgentId: new Map(),
      keptAgentIds: new Set(),
    };

    for (const agentRow of agentRows) {
      stepAgents.applicationIdByAgentId.set(
        agentRow.id,
        agentRow.applicationId,
      );

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

  // a role with row-level predicates is left out of the map, so its agents are kept
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
        .map((role) => [
          role.id,
          buildAiRunScopeFromStepAgentRole({
            canUpdateAllSettings: role.canUpdateAllSettings,
            canAccessAllTools: role.canAccessAllTools,
            objectPermissions: objectPermissionRows
              .filter(({ roleId }) => roleId === role.id)
              .map(({ roleId: _roleId, ...permission }) => permission),
            fieldPermissions: fieldPermissionRows
              .filter(({ roleId }) => roleId === role.id)
              .map(({ roleId: _roleId, ...permission }) => permission),
            permissionFlagUniversalIdentifiers: flagRows
              .filter(({ roleId }) => roleId === role.id)
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
  }): Promise<WorkflowTables> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const findTable = async ({
      universalIdentifier,
      tableName,
    }: {
      universalIdentifier: string;
      tableName: string;
    }): Promise<string | null> => {
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
      workflowVersion: await findTable({
        universalIdentifier: STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        tableName: 'workflowVersion',
      }),
      workflowRun: await findTable({
        universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
        tableName: 'workflowRun',
      }),
    };
  }
}
