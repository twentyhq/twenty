import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findFlatFieldMetadataByName } from 'src/database/commands/upgrade-version-command/2-27/utils/find-flat-field-metadata-by-name.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ConnectionReciprocalService } from 'src/modules/connection/services/connection-reciprocal.service';

const CONNECTION_OBJECT_NAME_SINGULAR = 'connection';
const IS_RECIPROCAL_FIELD_NAME = 'isReciprocal';

@RegisteredWorkspaceCommand('2.27.0', 1785830000000)
@Command({
  name: 'upgrade:2-27:backfill-connection-reciprocals',
  description:
    'Generate the reverse of every existing connection, so a person record shows all of their connections in one field instead of splitting them across two by storage direction.',
})
export class BackfillConnectionReciprocalsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly connectionReciprocalService: ConnectionReciprocalService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const isReciprocalFlatFieldMetadata = findFlatFieldMetadataByName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingular: CONNECTION_OBJECT_NAME_SINGULAR,
      fieldName: IS_RECIPROCAL_FIELD_NAME,
    });

    if (!isDefined(isReciprocalFlatFieldMetadata)) {
      this.logger.log(
        `No connection.isReciprocal field for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would generate the missing connection reciprocals for workspace ${workspaceId}`,
      );

      return;
    }

    const createdCount =
      await this.connectionReciprocalService.createMissingReciprocals({
        workspaceId,
      });

    this.logger.log(
      `Generated ${createdCount} connection reciprocal(s) for workspace ${workspaceId}`,
    );
  }
}
