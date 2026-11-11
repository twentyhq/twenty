import { isNonEmptyString, isObject } from '@sniptt/guards';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { computeDatabaseEventTriggerConditionFromFilter } from 'twenty-shared/workflow';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type StoredTrigger = {
  type?: unknown;
  settings?: {
    eventName?: unknown;
    condition?: unknown;
    filter?: Parameters<
      typeof computeDatabaseEventTriggerConditionFromFilter
    >[0]['filter'];
  };
};

@RegisteredWorkspaceCommand('2.58.0', 1794409228217)
@Command({
  name: 'upgrade:2-58:add-condition-to-workflow-database-event-triggers',
  description:
    'Give workflow database event triggers the condition expression of their filter, when it gives the same result, so they are matched like agent and logic function triggers. The filter is kept for the visual editor.',
})
export class AddConditionToWorkflowDatabaseEventTriggersCommand extends ProvisionedWorkspaceCommandRunner {
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
        `No data source for workspace ${workspaceId}, skipping trigger condition conversion`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const objectMetadataIdByNameSingular = new Map(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map(({ nameSingular, id }) => [nameSingular, id]),
    );
    let keptFilterCount = 0;

    const addCondition = (trigger: StoredTrigger): StoredTrigger => {
      const settings = trigger.settings;

      if (
        trigger.type !== 'DATABASE_EVENT' ||
        !isDefined(settings) ||
        !isNonEmptyString(settings.eventName) ||
        isNonEmptyString(settings.condition) ||
        !isObject(settings.filter)
      ) {
        return trigger;
      }

      const objectMetadataId = objectMetadataIdByNameSingular.get(
        settings.eventName.split('.')[0],
      );
      const condition = isDefined(objectMetadataId)
        ? computeDatabaseEventTriggerConditionFromFilter({
            eventName: settings.eventName,
            filter: settings.filter,
            fields: buildValidationRuleFieldDescriptors({
              objectMetadataId,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            }),
          })
        : undefined;

      if (!isDefined(condition)) {
        keptFilterCount += settings.filter.stepFilters?.length ? 1 : 0;

        return trigger;
      }

      return { ...trigger, settings: { ...settings, condition } };
    };

    const rewrittenVersionCount = await rewriteJsonbRowsWithCompareAndSet<
      StoredTrigger[] | null
    >({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'triggers',
      whereClause: `"workspaceId" = $1 AND triggers::text LIKE '%"DATABASE_EVENT"%' AND triggers::text LIKE '%stepFilters%'`,
      whereParameters: [workspaceId],
      mapRow: ({ value }) => {
        if (!Array.isArray(value)) {
          return { value, hasChanged: false };
        }

        const triggers = value.map(addCondition);

        return {
          value: triggers,
          hasChanged: triggers.some(
            (trigger, index) => trigger !== value[index],
          ),
        };
      },
    });

    if (!isDryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
      await this.workspaceCacheService.flush(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);
    }

    if (rewrittenVersionCount + keptFilterCount === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: added a condition to the trigger of ${rewrittenVersionCount} workflow version(s); ${keptFilterCount} trigger filter(s) have no exact expression and keep the legacy filter`,
    );
  }
}
