import { Command } from 'nest-commander';
import { FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const CALL_RECORDING_OBJECT_NAME_SINGULAR = 'callRecording';

@RegisteredWorkspaceCommand('2.20.0', 1783528000000)
@Command({
  name: 'upgrade:2-20:backfill-call-recording-application-id',
  description:
    'Backfill callRecording.applicationId on recordings created by an application before the field was populated at creation time, mapping the createdBy actor name to the installed application universal identifier.',
})
export class BackfillCallRecordingApplicationIdCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const callRecordingObjectMetadata = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (object) => object.nameSingular === CALL_RECORDING_OBJECT_NAME_SINGULAR,
      );

    if (!isDefined(callRecordingObjectMetadata)) {
      this.logger.log(
        `callRecording object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // Legacy rows carry no applicationId, so ownership is recovered from the
    // createdBy actor: its name was stamped from application.name at creation.
    // We stamp the app's universalIdentifier (not the per-install id) to match
    // what the apps now write at create time and to stay stable across
    // reinstalls. Apps whose records exist but are no longer installed cannot
    // be resolved and are left null.
    const installedApplications =
      await this.applicationService.findManyInstalledFlatApplications(
        workspaceId,
      );

    if (installedApplications.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would backfill callRecording.applicationId across ${installedApplications.length} installed application(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(callRecordingObjectMetadata);

    let totalUpdated = 0;

    for (const application of installedApplications) {
      const result = await dataSource.query(
        `UPDATE "${schemaName}"."${tableName}"
         SET "applicationId" = $1
         WHERE "applicationId" IS NULL
           AND "createdBySource" = $2
           AND "createdByName" = $3`,
        [
          application.universalIdentifier,
          FieldActorSource.APPLICATION,
          application.name,
        ],
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      totalUpdated += result?.[1] ?? 0;
    }

    this.logger.log(
      `Backfilled callRecording.applicationId for ${totalUpdated} recording(s) across ${installedApplications.length} installed application(s) in workspace ${workspaceId}`,
    );
  }
}
