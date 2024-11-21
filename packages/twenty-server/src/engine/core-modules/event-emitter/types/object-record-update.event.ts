import {
  ObjectRecordDiff,
  ObjectRecordBaseEvent,
} from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

export class ObjectRecordUpdateEvent<T> extends ObjectRecordBaseEvent<T> {
  properties: {
    updatedFields: string[];
    before: T;
    after: T;
    diff: Partial<ObjectRecordDiff<T>>;
  };
}
