import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WRITE_ACTIONS = ['canUpdateFieldValue'];

const {
  message,
  messageThread,
  messageParticipant,
  calendarEvent,
  calendarEventParticipant,
} = STANDARD_OBJECTS;

const SYNCED_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS = [
  message.fields.headerMessageId,
  message.fields.subject,
  message.fields.text,
  message.fields.receivedAt,
  message.fields.messageThread,
  message.fields.messageCampaign,
  message.fields.isDraft,
  messageThread.fields.subject,
  messageParticipant.fields.role,
  messageParticipant.fields.handle,
  messageParticipant.fields.displayName,
  messageParticipant.fields.message,
  messageParticipant.fields.person,
  messageParticipant.fields.workspaceMember,
  messageParticipant.fields.messageCampaign,
  calendarEvent.fields.title,
  calendarEvent.fields.isCanceled,
  calendarEvent.fields.isFullDay,
  calendarEvent.fields.startsAt,
  calendarEvent.fields.endsAt,
  calendarEvent.fields.externalCreatedAt,
  calendarEvent.fields.externalUpdatedAt,
  calendarEvent.fields.description,
  calendarEvent.fields.location,
  calendarEvent.fields.iCalUid,
  calendarEvent.fields.conferenceSolution,
  calendarEvent.fields.conferenceLink,
  calendarEventParticipant.fields.handle,
  calendarEventParticipant.fields.displayName,
  calendarEventParticipant.fields.isOrganizer,
  calendarEventParticipant.fields.responseStatus,
  calendarEventParticipant.fields.calendarEvent,
  calendarEventParticipant.fields.person,
  calendarEventParticipant.fields.workspaceMember,
].map(({ universalIdentifier }) => universalIdentifier);

@RegisteredWorkspaceCommand('2.65.0', 1795711734552)
@Command({
  name: 'upgrade:2-65:lock-synced-standard-fields',
  description:
    'Disable updates on the standard fields of messages, threads, participants and calendar events, which only the sync writes',
})
export class LockSyncedStandardFieldsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const filter = `"workspaceId" = $1
      AND "universalIdentifier" = ANY($2::uuid[])
      AND NOT COALESCE("disabledFieldPermissionActions", '[]'::jsonb) @> $3::jsonb`;
    const parameters = [
      workspaceId,
      SYNCED_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS,
      JSON.stringify(WRITE_ACTIONS),
    ];

    if (options.dryRun) {
      const [{ count }] = await this.coreDataSource.query(
        `SELECT COUNT(*)::int AS "count" FROM "core"."fieldMetadata" WHERE ${filter}`,
        parameters,
      );

      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would lock ${count} synced standard field(s)`,
      );

      return;
    }

    const [lockedFields] = await this.coreDataSource.query(
      `UPDATE "core"."fieldMetadata"
       SET "disabledFieldPermissionActions" = (
         SELECT jsonb_agg(DISTINCT "action" ORDER BY "action")
         FROM jsonb_array_elements_text(
           COALESCE("disabledFieldPermissionActions", '[]'::jsonb) || $3::jsonb
         ) AS "action"
       )
       WHERE ${filter}
       RETURNING "id"`,
      parameters,
    );

    if (lockedFields.length === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps([
        getMetadataFlatEntityMapsKey('fieldMetadata'),
      ]),
    );

    this.logger.log(
      `Workspace ${workspaceId}: locked ${lockedFields.length} synced standard field(s)`,
    );
  }
}
