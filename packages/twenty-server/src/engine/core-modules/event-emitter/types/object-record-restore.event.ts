import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';

export class ObjectRecordRestoreEvent<
  T = object,
> extends ObjectRecordCreateEvent<T> {
  properties: {
    after: T;
  };
}
