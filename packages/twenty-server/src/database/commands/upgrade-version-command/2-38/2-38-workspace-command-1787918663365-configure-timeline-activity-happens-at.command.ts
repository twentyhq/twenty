import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { validateStandardMetadataUpdateCount } from 'src/database/commands/upgrade-version-command/2-34/utils/validate-standard-metadata-update-count.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38 } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-happens-at-2-38.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.38.0', 1787918663365)
@Command({
  name: 'upgrade:2-38:configure-timeline-activity-happens-at',
  description:
    'Point the standard messageLinked and calendarEventLinked timeline activity types at their source semantic timestamp field',
})
export class ConfigureTimelineActivityHappensAtCommand extends ProvisionedWorkspaceCommandRunner {
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

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would configure timeline activity happensAt fields for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const happensAtValueClauses = STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38.map(
      (_, index) => `($${index * 2 + 3}::uuid, $${index * 2 + 4}::uuid)`,
    ).join(', ');
    const happensAtParameters =
      STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38.flatMap((definition) => [
        definition.universalIdentifier,
        definition.happensAtFieldUniversalIdentifier,
      ]);

    const happensAtResult = await dataSource.query<[unknown[], number]>(
      `UPDATE "core"."timelineActivityType" AS timeline_activity_type
       SET "happensAtFieldUniversalIdentifier" = happens_at."happensAtFieldUniversalIdentifier"
       FROM (VALUES ${happensAtValueClauses}) AS happens_at(
         "universalIdentifier",
         "happensAtFieldUniversalIdentifier"
       )
       WHERE timeline_activity_type."workspaceId" = $1
         AND timeline_activity_type."applicationId" = $2
         AND timeline_activity_type."universalIdentifier" = happens_at."universalIdentifier"`,
      [workspaceId, twentyStandardFlatApplication.id, ...happensAtParameters],
    );

    validateStandardMetadataUpdateCount({
      actualCount: happensAtResult[1],
      expectedCount: STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38.length,
      logger: this.logger,
      metadataLabel: 'standard timeline activity happensAt fields',
      workspaceId,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatTimelineActivityTypeMaps',
    ]);
  }
}
