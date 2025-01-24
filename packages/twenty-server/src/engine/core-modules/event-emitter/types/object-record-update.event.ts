import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

export class ObjectRecordUpdateEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  properties: {
    updatedFields?: string[];
    diff?: Partial<ObjectRecordDiff<T>>;
    before: T;
    after: T;
  };
}
