import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';

export type ObjectRecordNonDestructiveEvent<T extends object> =
  | ObjectRecordCreateEvent<T>
  | ObjectRecordUpdateEvent<T>
  | ObjectRecordDeleteEvent<T>
  | ObjectRecordRestoreEvent<T>;
