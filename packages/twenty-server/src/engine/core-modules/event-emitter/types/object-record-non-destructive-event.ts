import { type ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { type ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { type ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { type ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { type ObjectRecordUpsertEvent } from 'src/engine/core-modules/event-emitter/types/object-record-upsert.event';

export type ObjectRecordNonDestructiveEvent =
  | ObjectRecordCreateEvent
  | ObjectRecordUpdateEvent
  | ObjectRecordDeleteEvent
  | ObjectRecordRestoreEvent
  | ObjectRecordUpsertEvent;
