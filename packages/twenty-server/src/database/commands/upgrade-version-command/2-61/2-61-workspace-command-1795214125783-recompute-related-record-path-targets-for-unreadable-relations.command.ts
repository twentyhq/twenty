import { Command } from 'nest-commander';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { RecordAccessGroupPropagationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-propagation.service';
import { findRoleIdsUnableToReadField } from 'src/engine/permissions/internal/access-group/utils/find-role-ids-unable-to-read-field.util';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { isRelatedRecordPathsEnabled } from 'src/engine/permissions/internal/related-record-path/utils/is-related-record-paths-enabled.util';
import { resolveRelatedRecordPaths } from 'src/engine/permissions/internal/related-record-path/utils/resolve-related-record-paths.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.61.0', 1795214125783)
@Command({
  name: 'upgrade:2-61:recompute-related-record-path-targets-for-unreadable-relations',
  description:
    'Recompute the access groups of related record path targets in workspaces where a role cannot read the first relation of a path',
})
export class RecomputeRelatedRecordPathTargetsForUnreadableRelationsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordAccessGroupPropagationService: RecordAccessGroupPropagationService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const {
      featureFlagsMap,
      rolesPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatRelatedRecordPathMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'featureFlagsMap',
      'rolesPermissions',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatRelatedRecordPathMaps',
    ]);

    if (
      !isAccessGroupsEnabled({ featureFlagsMap }) ||
      !isRelatedRecordPathsEnabled({ featureFlagsMap })
    ) {
      return;
    }

    const isPathRelationUnreadableByAnyRole = resolveRelatedRecordPaths({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatRelatedRecordPathMaps,
    }).some(({ hops, sourceFlatObjectMetadata }) =>
      isNonEmptyArray(
        findRoleIdsUnableToReadField({
          rolesPermissions,
          objectMetadataId: sourceFlatObjectMetadata.id,
          fieldMetadataId: hops[0].relationFieldMetadataId,
        }),
      ),
    );

    if (!isPathRelationUnreadableByAnyRole) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: recomputing related record path targets`,
    );

    if (options.dryRun) {
      return;
    }

    await this.recordAccessGroupPropagationService.planAndApplyRecomputeOfRelatedRecordPathTargets(
      { workspaceId },
    );
  }
}
