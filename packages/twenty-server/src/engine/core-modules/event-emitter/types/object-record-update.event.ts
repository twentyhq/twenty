import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';

type Diff<T> = {
  [K in keyof T]: { before: T[K]; after: T[K] };
};

export class ObjectRecordUpdateEvent<T> extends ObjectRecordBaseEvent {
  properties: {
    updatedFields?: string[];
    before: T;
    after: T;
    diff?: Partial<Diff<T>>;
  };
}
