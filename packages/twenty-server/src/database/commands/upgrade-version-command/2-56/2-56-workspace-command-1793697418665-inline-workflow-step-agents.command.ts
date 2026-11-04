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
} from 'src/database/commands/upgrade-version-command/2-56/utils/build-ai-run-scope-from-step-agent-role.util';
import { inlineWorkflowStepAgents } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-workflow-step-agents.util';
import {
  type StepAgentInlineConfig,
  type StoredWorkflowStep,
} from 'src/database/commands/upgrade-version-command/2-56/utils/step-agent-inline-config.type';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type StepAgentRow = {
  id: string;
  prompt: string;
  modelId: string;
  modelConfiguration: ModelConfiguration | null;
  responseFormat: AgentResponseFormat | null;
  roleId: string | null;
  isActive: boolean;
};

type StepAgentRoleRow = Required<
  Pick<RolePermissionGrants, 'canUpdateAllSettings' | 'canAccessAllTools'>
> & {
  id: string;
  hasRowLevelPermissionPredicates: boolean;
};

type StepAgents = {
  inlineConfigByAgentId: Map<string, StepAgentInlineConfig>;
  keptAgentIds: Set<string>;
};

// in-flight runs keep their agent, which the runtime still runs by agentId,
// so the later deletion command must skip agents still referenced by runnable runs
@RegisteredWorkspaceCommand('2.56.0', 1793697418665)
@Command({
  name: 'upgrade:2-56:inline-workflow-step-agents',
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

    const keptStepAgentIds = new Set<string>();
    const inlineSteps = ({ value }: { value: StoredWorkflowStep[] }) => {
      const result = inlineWorkflowStepAgents({
        steps: value,
        inlineConfigByAgentId: stepAgents.inlineConfigByAgentId,
        keptAgentIds: stepAgents.keptAgentIds,
      });

      result.keptStepAgentIds.forEach((agentId) =>
        keptStepAgentIds.add(agentId),
      );

      return { value: result.steps, hasChanged: result.hasChanged };
    };

    const coreWorkflowVersionCount = await rewriteJsonbRowsWithCompareAndSet({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND steps @> '[{"type":"AI_AGENT"}]'`,
      whereParameters: [workspaceId],
      mapRow: inlineSteps,
    });

    const workflowVersionTable = await this.findWorkflowVersionTable({
      dataSource,
      workspaceId,
    });
    const workflowVersionCount = isDefined(workflowVersionTable)
      ? await rewriteJsonbRowsWithCompareAndSet({
          dataSource,
          isDryRun,
          tableName: workflowVersionTable,
          columnName: 'steps',
          whereClause: `steps @> '[{"type":"AI_AGENT"}]'`,
          whereParameters: [],
          mapRow: inlineSteps,
        })
      : 0;

    const visibleAgentCount = await this.makeKeptStepAgentsVisible({
      dataSource,
      isDryRun,
      agentIds: [...keptStepAgentIds],
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
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: inlined the agents of ${coreWorkflowVersionCount} core workflow version(s) and ${workflowVersionCount} workflow version(s), and made ${visibleAgentCount} kept step agent(s) visible`,
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
      `SELECT agent.id, agent.prompt, agent."modelId", agent."modelConfiguration",
         agent."responseFormat", agent."isActive", target."roleId"
       FROM core."agent" agent
       LEFT JOIN core."roleTarget" target ON target."agentId" = agent.id
       WHERE agent."workspaceId" = $1
         AND agent."isSystem" = true
         AND agent."applicationId" = $2
         AND agent."deletedAt" IS NULL
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
      inlineConfigByAgentId: new Map(),
      keptAgentIds: new Set(),
    };

    for (const agentRow of agentRows) {
      const scope = isDefined(agentRow.roleId)
        ? scopeByRoleId.get(agentRow.roleId)
        : null;

      if (!agentRow.isActive || scope === undefined) {
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

  private async makeKeptStepAgentsVisible({
    dataSource,
    isDryRun,
    agentIds,
  }: {
    dataSource: DataSource;
    isDryRun: boolean;
    agentIds: string[];
  }): Promise<number> {
    if (agentIds.length === 0 || isDryRun) {
      return agentIds.length;
    }

    // isSystem marks the hidden step agents the deferred deletion targets
    const [, updatedAgentCount]: [unknown, number] = await dataSource.query(
      `UPDATE core."agent" SET "isSystem" = false WHERE id = ANY($1::uuid[])`,
      [agentIds],
    );

    return updatedAgentCount;
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

  private async findWorkflowVersionTable({
    dataSource,
    workspaceId,
  }: {
    dataSource: DataSource;
    workspaceId: string;
  }): Promise<string | null> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (
      !isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier:
            STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        }),
      )
    ) {
      return null;
    }

    const tableName = `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}."workflowVersion"`;
    const [table]: { name: string | null }[] = await dataSource.query(
      'SELECT to_regclass($1) AS name',
      [tableName],
    );

    return isDefined(table?.name) ? tableName : null;
  }
}
