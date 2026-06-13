import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// The create-record UI affordance is now gated on isUICreatable alone (the
// !isSystem clause was dropped). Standard system objects relied on that clause
// to stay non-creatable, so their isUICreatable (default true) must be flipped
// to false to preserve behavior. Sync/system-created objects only — the
// user-creatable system objects (e.g. marketing message lists) keep true.
const NON_UI_CREATABLE_STANDARD_SYSTEM_OBJECT_NAMES = [
  'attachment',
  'blocklist',
  'calendarChannelEventAssociation',
  'calendarEventParticipant',
  'calendarEvent',
  'callRecording',
  'messageChannelMessageAssociation',
  'messageChannelMessageAssociationMessageFolder',
  'messageParticipant',
  'messageThread',
  'message',
  'noteTarget',
  'taskTarget',
  'timelineActivity',
  'workflowAutomatedTrigger',
];

@RegisteredInstanceCommand('2.13.0', 1781277480000, { type: 'slow' })
export class BackfillNonUiCreatableStandardSystemObjectsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."objectMetadata"
       SET "isUICreatable" = false
       WHERE "isSystem" = true
         AND "isUICreatable" = true
         AND "nameSingular" = ANY($1)`,
      [NON_UI_CREATABLE_STANDARD_SYSTEM_OBJECT_NAMES],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
