import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

export class ObjectRecordDestroyEvent<T> extends ObjectRecordBaseEvent {
  properties: {
    before: T;
  };
}
