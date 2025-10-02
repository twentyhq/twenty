import { type ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

export class ObjectRecordUpsertEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  properties: {
    before?: T;
    after: T;
    diff?: Partial<ObjectRecordDiff<T>>;
    updatedFields?: string[];
  };
}
