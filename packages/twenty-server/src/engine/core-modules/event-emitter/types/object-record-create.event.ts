import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

export class ObjectRecordCreateEvent<T> extends ObjectRecordBaseEvent {
  properties: {
    after: T;
  };
}
