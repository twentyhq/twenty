import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';

export type ObjectRecordEvent<T = object> =
  | ObjectRecordUpdateEvent<T>
  | ObjectRecordDeleteEvent<T>
  | ObjectRecordCreateEvent<T>
  | ObjectRecordDestroyEvent<T>
  | ObjectRecordRestoreEvent<T>;
