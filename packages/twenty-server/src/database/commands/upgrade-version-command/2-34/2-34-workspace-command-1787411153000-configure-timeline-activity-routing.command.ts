import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS } from 'src/engine/metadata-modules/timeline-activity-type/constants/standard-timeline-activity-type-definitions.constant';

const STANDARD_ROUTINGS = STANDARD_TIMELINE_ACTIVITY_TYPE_DEFINITIONS.filter(
  ({ targetRelationFieldUniversalIdentifier }) =>
    isDefined(targetRelationFieldUniversalIdentifier),
);

const JUNCTION_TARGETS = [
  {
    relationFieldUniversalIdentifier:
      STANDARD_OBJECTS.message.fields.messageParticipants.universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.messageParticipant.fields.person.universalIdentifier,
  },
  {
    relationFieldUniversalIdentifier:
      STANDARD_OBJECTS.calendarEvent.fields.calendarEventParticipants
        .universalIdentifier,
    targetFieldUniversalIdentifier:
      STANDARD_OBJECTS.calendarEventParticipant.fields.person
        .universalIdentifier,
  },
];

@RegisteredWorkspaceCommand('2.34.0', 1787411153000)
@Command({
  name: 'upgrade:2-34:configure-timeline-activity-routing',
  description:
    'Move standard linked timeline events to the generic application contract',
})
export class ConfigureTimelineActivityRoutingCommand extends ProvisionedWorkspaceCommandRunner {
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
        `[DRY RUN] Would configure generic timeline activity routing for workspace ${workspaceId}`,
      );

      return;
    }

    const routingValueClauses = STANDARD_ROUTINGS.map(
      (_, index) =>
        `($${index * 3 + 2}::uuid, $${index * 3 + 3}::uuid, $${index * 3 + 4}::uuid[])`,
    ).join(', ');
    const routingParameters = STANDARD_ROUTINGS.flatMap((definition) => [
      definition.universalIdentifier,
      definition.targetRelationFieldUniversalIdentifier,
      definition.triggerFieldUniversalIdentifiers ?? null,
    ]);

    await dataSource.query(
      `UPDATE "core"."timelineActivityType" AS timeline_activity_type
       SET "targetRelationFieldUniversalIdentifier" = routing."targetRelationFieldUniversalIdentifier",
           "triggerFieldUniversalIdentifiers" = routing."triggerFieldUniversalIdentifiers"
       FROM (VALUES ${routingValueClauses}) AS routing(
         "universalIdentifier",
         "targetRelationFieldUniversalIdentifier",
         "triggerFieldUniversalIdentifiers"
       )
       WHERE timeline_activity_type."workspaceId" = $1
         AND timeline_activity_type."universalIdentifier" = routing."universalIdentifier"`,
      [workspaceId, ...routingParameters],
      undefined,
      { shouldBypassPermissionChecks: true },
    );

    const junctionConditions = JUNCTION_TARGETS.map(
      (_, index) =>
        `(source_field."universalIdentifier" = $${index * 2 + 2}::uuid AND target_field."universalIdentifier" = $${index * 2 + 3}::uuid)`,
    ).join(' OR ');

    await dataSource.query(
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
  }
}
