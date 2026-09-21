import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildSystemRelationFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1790022847628)
@Command({
  name: 'upgrade:2-42:backfill-agent-chat-thread-custom-targets',
  description: 'Add private agent chat thread relations to existing custom and application objects',
})
export class BackfillAgentChatThreadCustomTargetsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) { super(workspaceIteratorService); }

  override async runOnWorkspace({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps', 'flatFieldMetadataMaps', 'flatIndexMaps',
    ]);
    const agentChatThreadTarget = flatObjectMetadataMaps.byUniversalIdentifier[STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier];
    if (!isDefined(agentChatThreadTarget)) {
      throw new Error('Provision agent chat thread targets before backfilling custom relations');
    }
    for (const sourceFlatObjectMetadata of Object.values(flatObjectMetadataMaps.byUniversalIdentifier).filter(isDefined)) {
      if (sourceFlatObjectMetadata.applicationUniversalIdentifier === TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER) continue;
      const { forwardFlatFieldMetadata, reverseFlatFieldMetadata, flatIndexMetadata } = buildSystemRelationFlatFieldMetadatasForObject({
        sourceFlatObjectMetadata,
        standardTargetFlatObjectMetadataByNameSingular: { agentChatThreadTarget },
        standardObjectNames: ['agentChatThreadTarget'],
        applicationUniversalIdentifier: sourceFlatObjectMetadata.applicationUniversalIdentifier,
      })[0];
      const fields = [forwardFlatFieldMetadata, reverseFlatFieldMetadata];
      const missingFields = fields.filter(({ universalIdentifier }) => !isDefined(flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]));
      const existingIndex = Object.values(flatIndexMaps.byUniversalIdentifier).filter(isDefined).find(({ name, objectMetadataUniversalIdentifier }) => name === flatIndexMetadata.name && objectMetadataUniversalIdentifier === agentChatThreadTarget.universalIdentifier);
      if (missingFields.length === 1) {
        throw new Error(`Incomplete agent chat thread relation on ${sourceFlatObjectMetadata.nameSingular}; repair metadata before retrying`);
      }
      if ((missingFields.length === 0 && isDefined(existingIndex)) || options.dryRun) continue;
      const result = await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration({
        workspaceId, isSystemBuild: true,
        applicationUniversalIdentifier: sourceFlatObjectMetadata.applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: { flatEntityToCreate: missingFields, flatEntityToUpdate: [], flatEntityToDelete: [] },
          index: { flatEntityToCreate: isDefined(existingIndex) ? [] : [flatIndexMetadata], flatEntityToUpdate: [], flatEntityToDelete: [] },
        },
      });
      if (result.status === 'fail') throw new Error(`Failed to backfill agent chat thread relations: ${JSON.stringify(result)}`);
    }
  }
}
