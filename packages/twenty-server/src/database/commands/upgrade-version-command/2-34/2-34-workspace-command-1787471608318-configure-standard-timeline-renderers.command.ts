import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { hasTimelineActivityObjectMetadata } from 'src/database/commands/upgrade-version-command/2-34/utils/has-timeline-activity-object-metadata.util';
import { validateStandardMetadataUpdateCount } from 'src/database/commands/upgrade-version-command/2-34/utils/validate-standard-metadata-update-count.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Replaying 2.34 must not pick up renderers introduced by a later release.
const STANDARD_TYPES_WITH_RENDERERS = [
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0f',
    frontComponentUniversalIdentifier: '8b4da8ed-4a87-480d-bcad-a791262cb890',
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c10',
    frontComponentUniversalIdentifier: '3c70dd28-42f3-41da-8f41-22013d65ff50',
  },
] as const;

@RegisteredWorkspaceCommand('2.34.0', 1787471608318)
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    if (!hasTimelineActivityObjectMetadata(flatObjectMetadataMaps)) {
      this.logger.log(
        `timelineActivity object does not exist for workspace ${workspaceId}, skipping`,
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

    const [, updatedRowCount] = await dataSource.query<[unknown[], number]>(
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

    validateStandardMetadataUpdateCount({
      actualCount: updatedRowCount,
      expectedCount: STANDARD_TYPES_WITH_RENDERERS.length,
      logger: this.logger,
      metadataLabel: 'standard timeline renderers',
      workspaceId,
    });
  }
}
