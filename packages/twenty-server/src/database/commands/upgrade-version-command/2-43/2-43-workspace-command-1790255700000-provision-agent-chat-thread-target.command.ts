import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getAgentChatThreadTargetSchemaAdditions } from 'src/database/commands/upgrade-version-command/2-43/utils/get-agent-chat-thread-target-schema-additions.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// The standard application is synchronized only when a workspace is created, so
// declaring agentChatThreadTarget in STANDARD_OBJECTS leaves every existing
// workspace without the table. This provisions it the same way agent history
// provisioned its five objects: an additive from/to migration over the standard
// definitions, which custom-object side effects must not expand.
@RegisteredWorkspaceCommand('2.43.0', 1790255700000)
@Command({
  name: 'upgrade:2-43:provision-agent-chat-thread-target',
  description:
    'Create the agentChatThreadTarget object, its fields and its indexes for existing workspaces',
})
export class ProvisionAgentChatThreadTargetCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options.dryRun ?? false;

    // The migration builder mutates its optimistic maps, even on dry runs.
    // Keep those changes out of the live metadata cache until DDL succeeds.
    const existing = structuredClone(
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'featureFlagsMap',
      ]),
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      allFlatEntityMaps: standard,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const hasThreadObject = isDefined(
      existing.flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ],
    );

    if (!hasThreadObject) {
      // The agent history migration earlier in this segment skips workspaces
      // with no schema; provisioning one syncs the whole standard application,
      // which creates agentChatThreadTarget and both relation legs.
      this.logger.log(
        `Workspace ${workspaceId} has no agentChatThread, skipping; workspace provisioning creates agentChatThreadTarget`,
      );

      return;
    }

    const { objects, fields, indexes } =
      getAgentChatThreadTargetSchemaAdditions({ existing, standard });

    if (objects.length + fields.length + indexes.length === 0) {
      this.logger.log(
        `Workspace ${workspaceId} already carries agentChatThreadTarget, skipping`,
      );

      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          workspaceId,
          dryRun,
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: {},
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
          additionalCacheDataMaps: {
            featureFlagsMap: existing.featureFlagsMap,
          },
          idByUniversalIdentifierByMetadataName,
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: existing.flatObjectMetadataMaps,
              to: objects.reduce(
                (maps, flatEntity) =>
                  addFlatEntityToFlatEntityMapsOrThrow({
                    flatEntityMaps: maps,
                    flatEntity,
                  }),
                existing.flatObjectMetadataMaps,
              ),
            },
            flatFieldMetadataMaps: {
              from: existing.flatFieldMetadataMaps,
              to: fields.reduce(
                (maps, flatEntity) =>
                  addFlatEntityToFlatEntityMapsOrThrow({
                    flatEntityMaps: maps,
                    flatEntity,
                  }),
                existing.flatFieldMetadataMaps,
              ),
            },
            flatIndexMaps: {
              from: existing.flatIndexMaps,
              to: indexes.reduce(
                (maps, flatEntity) =>
                  addFlatEntityToFlatEntityMapsOrThrow({
                    flatEntityMaps: maps,
                    flatEntity,
                  }),
                existing.flatIndexMaps,
              ),
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `agentChatThreadTarget provisioning failed for workspace ${workspaceId}: ${JSON.stringify(
          result,
        )}`,
      );
    }
  }
}
