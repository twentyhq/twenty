import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';

export class ObjectRecordUpdateEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  properties: {
    updatedFields?: string[];
    before: T;
    after: T;
    diff?: Partial<ObjectRecordDiff<T>>;
  };
}
