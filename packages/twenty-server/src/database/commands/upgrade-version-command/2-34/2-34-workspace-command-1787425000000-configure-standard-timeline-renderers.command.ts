import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-type-definitions.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const STANDARD_TYPES_WITH_RENDERERS =
  STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS.filter(
    (
      definition,
    ): definition is typeof definition & {
      frontComponentUniversalIdentifier: string;
    } => isDefined(definition.frontComponentUniversalIdentifier),
  );

@RegisteredWorkspaceCommand('2.34.0', 1787425000000)
@Command({
  name: 'upgrade:2-34:configure-standard-timeline-renderers',
  description: 'Attach standard timeline previews through renderer identifiers',
})
export class ConfigureStandardTimelineRenderersCommand extends ProvisionedWorkspaceCommandRunner {
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

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would configure standard timeline renderers for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const values = STANDARD_TYPES_WITH_RENDERERS.map(
      (_, index) => `($${index * 2 + 3}::uuid, $${index * 2 + 4}::uuid)`,
    ).join(', ');
    const parameters = STANDARD_TYPES_WITH_RENDERERS.flatMap((definition) => [
      definition.universalIdentifier,
      definition.frontComponentUniversalIdentifier,
    ]);

    await dataSource.query(
      `UPDATE "core"."timelineActivityType" AS timeline_activity_type
       SET "frontComponentUniversalIdentifier" = renderer."frontComponentUniversalIdentifier"
       FROM (VALUES ${values}) AS renderer(
         "universalIdentifier",
         "frontComponentUniversalIdentifier"
       )
       WHERE timeline_activity_type."workspaceId" = $1
         AND timeline_activity_type."applicationId" = $2
         AND timeline_activity_type."universalIdentifier" = renderer."universalIdentifier"`,
      [workspaceId, twentyStandardFlatApplication.id, ...parameters],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatTimelineActivityTypeMaps',
    ]);
  }
}
