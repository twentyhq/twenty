import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Replaying 2.34 must not pick up routing types introduced by a later release.
const STANDARD_ROUTINGS = [
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c09',
    targetRelationFieldUniversalIdentifier:
      '20202020-1f25-43fe-8b00-af212fdde823',
    triggerFieldUniversalIdentifiers: null,
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0a',
    targetRelationFieldUniversalIdentifier:
      '20202020-1f25-43fe-8b00-af212fdde823',
    triggerFieldUniversalIdentifiers: null,
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0b',
    targetRelationFieldUniversalIdentifier:
      '20202020-1f25-43fe-8b00-af212fdde823',
    triggerFieldUniversalIdentifiers: [
      '20202020-faeb-4c76-8ba6-ccbb0b4a965f',
    ],
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0c',
    targetRelationFieldUniversalIdentifier:
      '20202020-de9c-4d0e-a452-713d4a3e5fc7',
    triggerFieldUniversalIdentifiers: null,
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0d',
    targetRelationFieldUniversalIdentifier:
      '20202020-de9c-4d0e-a452-713d4a3e5fc7',
    triggerFieldUniversalIdentifiers: null,
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0e',
    targetRelationFieldUniversalIdentifier:
      '20202020-de9c-4d0e-a452-713d4a3e5fc7',
    triggerFieldUniversalIdentifiers: [
      '20202020-b386-4cb7-aa5a-08d4a4d92680',
    ],
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0f',
    targetRelationFieldUniversalIdentifier:
      '20202020-7cff-4a74-b63c-73228448cbd9',
    triggerFieldUniversalIdentifiers: null,
  },
  {
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c10',
    targetRelationFieldUniversalIdentifier:
      '20202020-e07e-4ccb-88f5-6f3d00458eec',
    triggerFieldUniversalIdentifiers: null,
  },
] as const;

const JUNCTION_TARGETS = [
  {
    relationFieldUniversalIdentifier:
      '20202020-7cff-4a74-b63c-73228448cbd9',
    targetFieldUniversalIdentifier:
      '20202020-249d-4e0f-82cd-1b9df5cd3da2',
  },
  {
    relationFieldUniversalIdentifier:
      '20202020-e07e-4ccb-88f5-6f3d00458eec',
    targetFieldUniversalIdentifier:
      '20202020-5761-4842-8186-e1898ef93966',
  },
] as const;

@RegisteredWorkspaceCommand('2.34.0', 1787411153000)
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const routingValueClauses = STANDARD_ROUTINGS.map(
      (_, index) =>
        `($${index * 3 + 3}::uuid, $${index * 3 + 4}::uuid, $${index * 3 + 5}::uuid[])`,
    ).join(', ');
    const routingParameters = STANDARD_ROUTINGS.flatMap((definition) => [
      definition.universalIdentifier,
      definition.targetRelationFieldUniversalIdentifier,
      definition.triggerFieldUniversalIdentifiers ?? null,
    ]);

    let routingResult: [unknown[], number] | undefined;
    let junctionResult: [unknown[], number] | undefined;

    try {
      routingResult = await dataSource.query<[unknown[], number]>(
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
        undefined,
        { shouldBypassPermissionChecks: true },
      );

      const junctionConditions = JUNCTION_TARGETS.map(
        (_, index) =>
          `(source_field."universalIdentifier" = $${index * 2 + 2}::uuid AND target_field."universalIdentifier" = $${index * 2 + 3}::uuid)`,
      ).join(' OR ');

      junctionResult = await dataSource.query<[unknown[], number]>(
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
        undefined,
        { shouldBypassPermissionChecks: true },
      );
    } finally {
      if (isDefined(routingResult)) {
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatTimelineActivityTypeMaps',
          'flatFieldMetadataMaps',
        ]);
      }
    }

    if (!isDefined(routingResult) || !isDefined(junctionResult)) {
      throw new Error(
        `Timeline activity routing did not finish for workspace ${workspaceId}`,
      );
    }

    if (routingResult[1] !== STANDARD_ROUTINGS.length) {
      throw new Error(
        `Expected to configure ${STANDARD_ROUTINGS.length} standard timeline activity routings for workspace ${workspaceId}, updated ${routingResult[1]}`,
      );
    }

    if (junctionResult[1] !== JUNCTION_TARGETS.length) {
      throw new Error(
        `Expected to configure ${JUNCTION_TARGETS.length} standard junction targets for workspace ${workspaceId}, updated ${junctionResult[1]}`,
      );
    }
  }
}
