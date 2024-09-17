import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

export class ObjectRecordUpdateEvent<T> extends ObjectRecordBaseEvent {
  properties: {
    updatedFields: string[];
    before: T;
    after: T;
    diff?: Partial<T>;
  };
}
