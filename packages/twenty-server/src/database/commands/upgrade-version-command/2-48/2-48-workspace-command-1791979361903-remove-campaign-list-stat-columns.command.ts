import { Command } from 'nest-commander';
import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  getSystemViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGN = STANDARD_OBJECTS.messageCampaign;

const STAT_FIELD_NAMES = [
  'sentCount',
  'deliveredCount',
  'failedCount',
  'skippedCount',
  'bouncedCount',
  'complainedCount',
  'uniqueClickCount',
  'clickRate',
  'uniqueOpenCount',
  'openRate',
] as const;

const STAT_COLUMN_UNIVERSAL_IDENTIFIERS = STAT_FIELD_NAMES.map((fieldName) =>
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier:
      CAMPAIGN.views.allMessageCampaigns.universalIdentifier,
    fieldMetadataUniversalIdentifier:
      CAMPAIGN.fields[fieldName].universalIdentifier,
  }),
);

@RegisteredWorkspaceCommand('2.48.0', 1791979361903)
@Command({
  name: 'upgrade:2-48:remove-campaign-list-stat-columns',
  description:
    'Remove the delivery and engagement stat columns from the all campaigns view in existing workspaces',
})
export class RemoveCampaignListStatColumnsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewFieldMaps',
      ]);

    const viewFieldsToDelete = STAT_COLUMN_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatViewField>({
          flatEntityMaps: flatViewFieldMaps,
          universalIdentifier,
        }),
    ).filter(isDefined);

    if (viewFieldsToDelete.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would remove ${viewFieldsToDelete.length} campaign list stat column(s)`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to remove the campaign list stat columns for workspace ${workspaceId}`,
      );
    }
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {}
}
