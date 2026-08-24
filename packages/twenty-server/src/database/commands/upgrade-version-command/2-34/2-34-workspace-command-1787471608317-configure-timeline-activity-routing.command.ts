import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { hasTimelineActivityObjectMetadata } from 'src/database/commands/upgrade-version-command/2-34/utils/has-timeline-activity-object-metadata.util';
import { validateStandardMetadataUpdateCount } from 'src/database/commands/upgrade-version-command/2-34/utils/validate-standard-metadata-update-count.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34 } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-routing-2-34.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const JUNCTION_TARGETS = [
  {
    relationFieldUniversalIdentifier: '20202020-7cff-4a74-b63c-73228448cbd9',
    targetFieldUniversalIdentifier: '20202020-249d-4e0f-82cd-1b9df5cd3da2',
  },
  {
    relationFieldUniversalIdentifier: '20202020-e07e-4ccb-88f5-6f3d00458eec',
    targetFieldUniversalIdentifier: '20202020-5761-4842-8186-e1898ef93966',
  },
] as const;

@RegisteredWorkspaceCommand('2.34.0', 1787471608317)
@Command({
  name: 'upgrade:2-34:configure-timeline-activity-routing',
  description:
    'Move standard linked timeline events to the generic application contract',
})
export class ConfigureTimelineActivityRoutingCommand extends ProvisionedWorkspaceCommandRunner {
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
        `[DRY RUN] Would configure generic timeline activity routing for workspace ${workspaceId}`,
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

    const routingValueClauses = STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34.map(
      (_, index) =>
        `($${index * 3 + 3}::uuid, $${index * 3 + 4}::uuid, $${index * 3 + 5}::uuid[])`,
    ).join(', ');
    const routingParameters = STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34.flatMap(
      (definition) => [
        definition.universalIdentifier,
        definition.targetRelationFieldUniversalIdentifier,
        definition.triggerFieldUniversalIdentifiers ?? null,
      ],
    );

    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const routingResult = await dataSource.query<[unknown[], number]>(
        `UPDATE "core"."timelineActivityType" AS timeline_activity_type
       SET "targetRelationFieldUniversalIdentifier" = routing."targetRelationFieldUniversalIdentifier",
           "triggerFieldUniversalIdentifiers" = routing."triggerFieldUniversalIdentifiers"
       FROM (VALUES ${routingValueClauses}) AS routing(
         "universalIdentifier",
         "targetRelationFieldUniversalIdentifier",
         "triggerFieldUniversalIdentifiers"
       )
       WHERE timeline_activity_type."workspaceId" = $1
         AND timeline_activity_type."applicationId" = $2
         AND timeline_activity_type."universalIdentifier" = routing."universalIdentifier"`,
        [workspaceId, twentyStandardFlatApplication.id, ...routingParameters],
        queryRunner,
        { shouldBypassPermissionChecks: true },
      );

      const junctionConditions = JUNCTION_TARGETS.map(
        (_, index) =>
          `(source_field."universalIdentifier" = $${index * 2 + 2}::uuid AND target_field."universalIdentifier" = $${index * 2 + 3}::uuid)`,
      ).join(' OR ');

      const junctionResult = await dataSource.query<[unknown[], number]>(
        `UPDATE "core"."fieldMetadata" AS source_field
       SET "settings" = COALESCE(source_field."settings", '{}'::jsonb) ||
         jsonb_build_object('junctionTargetFieldId', target_field."id")
       FROM "core"."fieldMetadata" AS target_field
       WHERE source_field."workspaceId" = $1
         AND target_field."workspaceId" = $1
         AND (${junctionConditions})`,
        [
          workspaceId,
          ...JUNCTION_TARGETS.flatMap(
            ({
              relationFieldUniversalIdentifier,
              targetFieldUniversalIdentifier,
            }) => [
              relationFieldUniversalIdentifier,
              targetFieldUniversalIdentifier,
            ],
          ),
        ],
        queryRunner,
        { shouldBypassPermissionChecks: true },
      );

      validateStandardMetadataUpdateCount({
        actualCount: routingResult[1],
        expectedCount: STANDARD_TIMELINE_ACTIVITY_ROUTINGS_2_34.length,
        logger: this.logger,
        metadataLabel: 'standard timeline activity routings',
        workspaceId,
      });
      validateStandardMetadataUpdateCount({
        actualCount: junctionResult[1],
        expectedCount: JUNCTION_TARGETS.length,
        logger: this.logger,
        metadataLabel: 'standard junction targets',
        workspaceId,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatTimelineActivityTypeMaps',
      'flatFieldMetadataMaps',
    ]);
  }
}
