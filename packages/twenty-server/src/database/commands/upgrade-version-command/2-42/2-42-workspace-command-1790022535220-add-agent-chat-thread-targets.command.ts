import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1790022535220)
@Command({
  name: 'upgrade:2-42:add-agent-chat-thread-targets',
  description: 'Provision private agent chat thread targets and their standard record relations',
})
export class AddAgentChatThreadTargetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const existing = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps', 'flatFieldMetadataMaps', 'flatIndexMaps',
    ]);
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow({ workspaceId });
    const { allFlatEntityMaps: standard } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(), workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });
    const target = STANDARD_OBJECTS.agentChatThreadTarget;
    const allFlatEntityOperationByMetadataName = {
      objectMetadata: {
        flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow({
          standardFlatEntityMaps: standard.flatObjectMetadataMaps,
          existingFlatEntityMaps: existing.flatObjectMetadataMaps,
          universalIdentifiers: [target.universalIdentifier],
        }),
        flatEntityToUpdate: [], flatEntityToDelete: [],
      },
      fieldMetadata: {
        flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow({
          standardFlatEntityMaps: standard.flatFieldMetadataMaps,
          existingFlatEntityMaps: existing.flatFieldMetadataMaps,
          universalIdentifiers: [
            ...Object.values(target.fields).map(({ universalIdentifier }) => universalIdentifier),
            STANDARD_OBJECTS.agentChatThread.fields.targets.universalIdentifier,
            STANDARD_OBJECTS.company.fields.agentChatThreadTargets.universalIdentifier,
            STANDARD_OBJECTS.person.fields.agentChatThreadTargets.universalIdentifier,
            STANDARD_OBJECTS.opportunity.fields.agentChatThreadTargets.universalIdentifier,
          ],
        }),
        flatEntityToUpdate: [], flatEntityToDelete: [],
      },
      index: {
        flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow({
          standardFlatEntityMaps: standard.flatIndexMaps,
          existingFlatEntityMaps: existing.flatIndexMaps,
          universalIdentifiers: Object.values(target.indexes).map(({ universalIdentifier }) => universalIdentifier),
        }),
        flatEntityToUpdate: [], flatEntityToDelete: [],
      },
    };
    if (options.dryRun || Object.values(allFlatEntityOperationByMetadataName).every(({ flatEntityToCreate }) => flatEntityToCreate.length === 0)) {
      return;
    }
    const result = await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration({
      workspaceId, isSystemBuild: true,
      applicationUniversalIdentifier: twentyStandardFlatApplication.universalIdentifier,
      allFlatEntityOperationByMetadataName,
    });
    if (result.status === 'fail') {
      throw new Error(`Failed to provision agent chat thread targets: ${JSON.stringify(result)}`);
    }
  }
}
