import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildValidationRuleTreeConversions } from 'src/database/commands/upgrade-version-command/2-65/utils/build-validation-rule-tree-conversions.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.65.0', 1795714382870)
@Command({
  name: 'upgrade:2-65:convert-validation-rules-to-trees',
  description:
    'Store each validation rule as a tree reading fields by identifier, instead of text and bindings',
})
export class ConvertValidationRulesToTreesCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatValidationRuleMaps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatValidationRuleMaps',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const { flatValidationRulesToUpdate, unparsableValidationRuleIds } =
      buildValidationRuleTreeConversions({
        flatValidationRules: Object.values(
          flatValidationRuleMaps.byUniversalIdentifier,
        ).filter(isDefined),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

    if (isNonEmptyArray(unparsableValidationRuleIds)) {
      this.logger.warn(
        `Workspace ${workspaceId}: validation rule(s) ${unparsableValidationRuleIds.join(', ')} do not parse, keep their text and are turned off`,
      );
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${flatValidationRulesToUpdate.length} validation rule(s)`,
    );

    if (options.dryRun || !isNonEmptyArray(flatValidationRulesToUpdate)) {
      return;
    }

    await this.updateFlatValidationRulesOrThrow({
      workspaceId,
      flatValidationRulesToUpdate,
    });
  }

  private async updateFlatValidationRulesOrThrow({
    workspaceId,
    flatValidationRulesToUpdate,
  }: {
    workspaceId: string;
    flatValidationRulesToUpdate: FlatValidationRule[];
  }): Promise<void> {
    const applicationUniversalIdentifiers = [
      ...new Set(
        flatValidationRulesToUpdate.map(
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
          validationRule: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: flatValidationRulesToUpdate.filter(
              (flatValidationRule) =>
                flatValidationRule.applicationUniversalIdentifier ===
                applicationUniversalIdentifier,
            ),
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
