import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildDatabaseEventTriggerConditionTreeConversions } from 'src/database/commands/upgrade-version-command/2-65/utils/build-database-event-trigger-condition-tree-conversions.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.65.0', 1795720389116)
@Command({
  name: 'upgrade:2-65:convert-trigger-conditions-to-trees',
  description:
    'Store each database event trigger condition of agents and logic functions as a tree reading fields by identifier, instead of text and bindings',
})
export class ConvertTriggerConditionsToTreesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      flatAgentMaps,
      flatLogicFunctionMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatLogicFunctionMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const {
      flatAgentsToUpdate,
      flatLogicFunctionsToUpdate,
      textConditionOwnerIds,
    } = buildDatabaseEventTriggerConditionTreeConversions({
      flatAgents: Object.values(flatAgentMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
      flatLogicFunctions: Object.values(
        flatLogicFunctionMaps.byUniversalIdentifier,
      ).filter(isDefined),
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (isNonEmptyArray(textConditionOwnerIds)) {
      this.logger.warn(
        `Workspace ${workspaceId}: trigger condition(s) of ${textConditionOwnerIds.join(', ')} do not compile and keep their text`,
      );
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${flatAgentsToUpdate.length} agent(s) and ${flatLogicFunctionsToUpdate.length} logic function(s)`,
    );

    if (
      options.dryRun ||
      (!isNonEmptyArray(flatAgentsToUpdate) &&
        !isNonEmptyArray(flatLogicFunctionsToUpdate))
    ) {
      return;
    }

    await this.updateTriggerOwnersOrThrow({
      workspaceId,
      flatAgentsToUpdate,
      flatLogicFunctionsToUpdate,
    });
  }

  private async updateTriggerOwnersOrThrow({
    workspaceId,
    flatAgentsToUpdate,
    flatLogicFunctionsToUpdate,
  }: {
    workspaceId: string;
    flatAgentsToUpdate: FlatAgent[];
    flatLogicFunctionsToUpdate: FlatLogicFunction[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = [
      ...new Set(
        [...flatAgentsToUpdate, ...flatLogicFunctionsToUpdate].map(
          ({ applicationUniversalIdentifier }) =>
            applicationUniversalIdentifier,
        ),
      ),
    ];

    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const migrationArgs = {
        shouldDeferActions: false,
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          agent: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: flatAgentsToUpdate.filter(
              (flatAgent) =>
                flatAgent.applicationUniversalIdentifier ===
                applicationUniversalIdentifier,
            ),
          },
          logicFunction: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: flatLogicFunctionsToUpdate.filter(
              (flatLogicFunction) =>
                flatLogicFunction.applicationUniversalIdentifier ===
                applicationUniversalIdentifier,
            ),
          },
        },
      };

      const result =
        await this.validateBuildAndRunWorkspaceMigration(migrationArgs);

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }

  private validateBuildAndRunWorkspaceMigration(
    migrationArgs: Parameters<
      WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunWorkspaceMigration']
    >[0],
  ) {
    if (
      migrationArgs.applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        migrationArgs,
      );
    }

    return this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
      migrationArgs,
    );
  }
}
