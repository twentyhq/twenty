import { isString } from '@sniptt/guards';
import { Command } from 'nest-commander';
import {
  type AgentResponseFormat,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import { type RolePermissionGrants } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  buildAiRunScopeFromStepAgentRole,
  type StoredFieldPermissionRow,
  type StoredObjectPermissionRow,
} from 'src/database/commands/upgrade-version-command/2-55/utils/build-ai-run-scope-from-step-agent-role.util';
import { buildConversationalStepAgentLabel } from 'src/database/commands/upgrade-version-command/2-55/utils/build-conversational-step-agent-label.util';
import {
  inlinePausedAgentRunSpec,
  type StoredRunSpec,
} from 'src/database/commands/upgrade-version-command/2-55/utils/inline-paused-agent-run-spec.util';
import { inlineWorkflowStepAgents } from 'src/database/commands/upgrade-version-command/2-55/utils/inline-workflow-step-agents.util';
import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-55/utils/step-agent-inline-config.type';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
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
  label: string;
  prompt: string;
  modelId: string;
  modelConfiguration: ModelConfiguration | null;
  responseFormat: AgentResponseFormat | null;
  roleId: string | null;
};

type StepAgentRoleRow = Required<
  Pick<RolePermissionGrants, 'canUpdateAllSettings' | 'canAccessAllTools'>
> & {
  id: string;
  hasRowLevelPermissionPredicates: boolean;
};

type StepAgents = {
  // the application step agents belong to, which a step without an agent runs under
  workspaceCustomApplicationId: string | null;
  inlineConfigByAgentId: Map<string, StepAgentInlineConfig>;
  labelByAgentId: Map<string, string>;
  // their role's row-level predicates have no scope equivalent, so their steps keep them
  keptAgentIds: Set<string>;
};

type WorkflowTables = {
  workflow: string | null;
  workflowVersion: string | null;
  workflowRun: string | null;
};

type StoredWakeUpPayload = {
  caller: { ref: { workflowRunId: string; stepId: string } };
  runSpec: StoredRunSpec;
};

type ConversationalStepAgentSource = {
  stepName: string | null;
  // where the step lives, to name the agent after its workflow
  table: 'coreWorkflowVersion' | 'workflowVersion' | 'workflowRun';
  rowId: string;
};

// Moves each builder AI step's hidden agent into the step; deleting the agents is a later command.
// A step with human input or a conversation is an Agent step: it keeps its agent, made visible so that deletion spares it
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
    const conversationalSourceByAgentId = new Map<
      string,
      ConversationalStepAgentSource
    >();
    const conversationalRunStepKeys = new Set<string>();
    const inlineSteps = ({
      sourceTable,
      rowId,
      steps,
    }: {
      sourceTable: ConversationalStepAgentSource['table'];
      rowId: string;
      steps: StoredWorkflowStep[];
    }) => {
      const result = inlineWorkflowStepAgents({
        steps,
        inlineConfigByAgentId: stepAgents.inlineConfigByAgentId,
        keptAgentIds: stepAgents.keptAgentIds,
      });

      for (const { stepId, stepName, agentId } of result.conversationalSteps) {
        if (!conversationalSourceByAgentId.has(agentId)) {
          conversationalSourceByAgentId.set(agentId, {
            stepName,
            table: sourceTable,
            rowId,
          });
        }

        if (sourceTable === 'workflowRun') {
          conversationalRunStepKeys.add(`${rowId}:${stepId}`);
        }
      }

      for (const keptStepId of result.keptStepIds) {
        this.logger.warn(
          `Workspace ${workspaceId}: step ${keptStepId} of ${sourceTable} ${rowId} keeps its agent, whose role has row-level predicates a step scope cannot express`,
        );
      }

      return { value: result.steps, hasChanged: result.hasChanged };
    };

    const coreWorkflowVersionCount = await rewriteJsonbRowsWithCompareAndSet<
      StoredWorkflowStep[]
    >({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"AI_AGENT"}]'`,
      whereParameters: [workspaceId],
      mapRow: ({ id, value }) =>
        inlineSteps({
          sourceTable: 'coreWorkflowVersion',
          rowId: id,
          steps: value,
        }),
    });

    const rewriteWorkflowVersions = async (): Promise<number> => {
      if (!isDefined(workflowTables.workflowVersion)) {
        return 0;
      }

      return rewriteJsonbRowsWithCompareAndSet<StoredWorkflowStep[]>({
        dataSource,
        isDryRun,
        tableName: workflowTables.workflowVersion,
        columnName: 'steps',
        whereClause: `steps @> '[{"type":"AI_AGENT"}]'`,
        whereParameters: [],
        mapRow: ({ id, value }) =>
          inlineSteps({
            sourceTable: 'workflowVersion',
            rowId: id,
            steps: value,
          }),
      });
    };

    const rewriteWorkflowRuns = async (): Promise<number> => {
      if (!isDefined(workflowTables.workflowRun)) {
        return 0;
      }

      return rewriteJsonbRowsWithCompareAndSet<{
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
            sourceTable: 'workflowRun',
            rowId: id,
            steps: state.flow.steps,
          });

          return {
            value: { ...state, flow: { ...state.flow, steps } },
            hasChanged,
          };
        },
      });
    };

    const workflowVersionCount = await rewriteWorkflowVersions();
    const workflowRunCount = await rewriteWorkflowRuns();

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
          const { agentId } = payload.runSpec;

          if (!isString(agentId)) {
            return { value: payload, hasChanged: false };
          }

          const inlineConfig = stepAgents.inlineConfigByAgentId.get(agentId);

          if (!isDefined(inlineConfig)) {
            return { value: payload, hasChanged: false };
          }

          const { workflowRunId, stepId } = payload.caller.ref;
          const pausedRun = inlinePausedAgentRunSpec({
            runSpec: payload.runSpec,
            isOnConversationalStep: conversationalRunStepKeys.has(
              `${workflowRunId}:${stepId}`,
            ),
            inlineConfig,
            applicationId: stepAgents.workspaceCustomApplicationId,
            stepId,
          });

          if (!pausedRun.isConversational) {
            return {
              value: { ...payload, runSpec: pausedRun.runSpec },
              hasChanged: true,
            };
          }

          if (!conversationalSourceByAgentId.has(agentId)) {
            conversationalSourceByAgentId.set(agentId, {
              stepName: isString(payload.runSpec.title)
                ? payload.runSpec.title
                : null,
              table: 'workflowRun',
              rowId: workflowRunId,
            });
          }

          return { value: payload, hasChanged: false };
        },
      });

    const visibleAgentCount = await this.makeConversationalStepAgentsVisible({
      dataSource,
      workspaceId,
      isDryRun,
      workflowTables,
      labelByAgentId: stepAgents.labelByAgentId,
      conversationalSourceByAgentId,
    });

    if (!isDryRun && coreWorkflowVersionCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    if (!isDryRun && visibleAgentCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatAgentMaps',
      ]);
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: inlined the agents of ${coreWorkflowVersionCount} core workflow version(s), ${workflowVersionCount} workflow version(s), ${workflowRunCount} workflow run(s) and ${pendingWakeUpCount} paused run(s), and made ${visibleAgentCount} conversational step agent(s) visible`,
    );
  }

  private async loadStepAgents({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<StepAgents> {
    const [{ workspaceCustomApplicationId }]: {
      workspaceCustomApplicationId: string | null;
    }[] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );

    // only builder steps create system agents in the custom application; an installed app's are its own
    const agentRows: StepAgentRow[] = await dataSource.query(
      `SELECT agent.id, agent.label, agent.prompt, agent."modelId", agent."modelConfiguration",
         agent."responseFormat", target."roleId"
       FROM core."agent" agent
       LEFT JOIN core."roleTarget" target ON target."agentId" = agent.id
       WHERE agent."workspaceId" = $1
         AND agent."isSystem" = true
         AND agent."applicationId" = $2
         AND COALESCE(jsonb_array_length(agent.triggers), 0) = 0`,
      [workspaceId, workspaceCustomApplicationId],
    );

    const scopeByRoleId = await this.loadRoleScopes({
      dataSource,
      roleIds: [
        ...new Set(agentRows.map(({ roleId }) => roleId).filter(isDefined)),
      ],
    });

    const stepAgents: StepAgents = {
      workspaceCustomApplicationId,
      inlineConfigByAgentId: new Map(),
      labelByAgentId: new Map(),
      keptAgentIds: new Set(),
    };

    for (const agentRow of agentRows) {
      stepAgents.labelByAgentId.set(agentRow.id, agentRow.label);

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
        modelConfiguration: agentRow.modelConfiguration,
        responseFormat: agentRow.responseFormat,
        scope,
      });
    }

    return stepAgents;
  }

  private async makeConversationalStepAgentsVisible({
    dataSource,
    workspaceId,
    isDryRun,
    workflowTables,
    labelByAgentId,
    conversationalSourceByAgentId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    isDryRun: boolean;
    workflowTables: WorkflowTables;
    labelByAgentId: ReadonlyMap<string, string>;
    conversationalSourceByAgentId: ReadonlyMap<
      string,
      ConversationalStepAgentSource
    >;
  }): Promise<number> {
    if (conversationalSourceByAgentId.size === 0) {
      return 0;
    }

    if (isDryRun) {
      return conversationalSourceByAgentId.size;
    }

    const workflowNameBySourceKey = await this.findWorkflowNames({
      dataSource,
      workflowTables,
      sources: [...conversationalSourceByAgentId.values()],
    });

    const visibleAgents = [...conversationalSourceByAgentId].map(
      ([agentId, source]) => ({
        id: agentId,
        label: buildConversationalStepAgentLabel({
          currentLabel: labelByAgentId.get(agentId) ?? '',
          workflowName:
            workflowNameBySourceKey.get(`${source.table}:${source.rowId}`) ??
            null,
          stepName: source.stepName,
        }),
      }),
    );

    // isSystem marks the hidden step agents the deferred deletion targets
    const [, updatedAgentCount]: [unknown, number] = await dataSource.query(
      `UPDATE core."agent" AS agent SET "isSystem" = false, label = visible.label
       FROM jsonb_to_recordset($2::jsonb) AS visible(id uuid, label text)
       WHERE agent.id = visible.id AND agent."workspaceId" = $1 AND agent."isSystem" = true`,
      [workspaceId, JSON.stringify(visibleAgents)],
    );

    return updatedAgentCount;
  }

  private async findWorkflowNames({
    dataSource,
    workflowTables,
    sources,
  }: {
    dataSource: DataSource;
    workflowTables: WorkflowTables;
    sources: ConversationalStepAgentSource[];
  }): Promise<Map<string, string | null>> {
    const queryByTable: Record<
      ConversationalStepAgentSource['table'],
      string | null
    > = {
      coreWorkflowVersion: `SELECT version.id, workflow.name FROM core."workflowVersion" version
         JOIN core."workflow" workflow ON workflow.id = version."coreWorkflowId"
         WHERE version.id = ANY($1::uuid[])`,
      workflowVersion:
        isDefined(workflowTables.workflow) &&
        isDefined(workflowTables.workflowVersion)
          ? `SELECT version.id, workflow.name FROM ${workflowTables.workflowVersion} version
             JOIN ${workflowTables.workflow} workflow ON workflow.id = version."workflowId"
             WHERE version.id = ANY($1::uuid[])`
          : null,
      workflowRun:
        isDefined(workflowTables.workflow) &&
        isDefined(workflowTables.workflowRun)
          ? `SELECT run.id, workflow.name FROM ${workflowTables.workflowRun} run
             JOIN ${workflowTables.workflow} workflow ON workflow.id = run."workflowId"
             WHERE run.id = ANY($1::uuid[])`
          : null,
    };

    const workflowNameBySourceKey = new Map<string, string | null>();

    for (const [table, query] of Object.entries(queryByTable)) {
      const rowIds = sources
        .filter((source) => source.table === table)
        .map(({ rowId }) => rowId);

      if (!isDefined(query) || rowIds.length === 0) {
        continue;
      }

      const rows: { id: string; name: string | null }[] =
        await dataSource.query(query, [rowIds]);

      for (const { id, name } of rows) {
        workflowNameBySourceKey.set(`${table}:${id}`, name);
      }
    }

    return workflowNameBySourceKey;
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
      (StoredObjectPermissionRow & { roleId: string })[],
      (StoredFieldPermissionRow & { roleId: string })[],
      { roleId: string; universalIdentifier: string }[],
    ] = await Promise.all([
      dataSource.query(
        `SELECT role.id, role."canUpdateAllSettings", role."canAccessAllTools",
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
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier,
          }),
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
      workflow: await findTable({
        universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
        tableName: 'workflow',
      }),
      workflowVersion: await findTable({
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        tableName: 'workflowVersion',
      }),
      workflowRun: await findTable({
        universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
        tableName: 'workflowRun',
      }),
    };
  }
}
