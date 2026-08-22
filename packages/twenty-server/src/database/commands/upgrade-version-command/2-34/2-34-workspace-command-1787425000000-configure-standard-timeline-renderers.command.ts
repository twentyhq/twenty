import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-type-definitions.constant';

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

    const values = STANDARD_TYPES_WITH_RENDERERS.map(
      (_, index) => `($${index * 2 + 2}::uuid, $${index * 2 + 3}::uuid)`,
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
         AND timeline_activity_type."universalIdentifier" = renderer."universalIdentifier"`,
      [workspaceId, ...parameters],
      undefined,
      { shouldBypassPermissionChecks: true },
    );
  }
}
