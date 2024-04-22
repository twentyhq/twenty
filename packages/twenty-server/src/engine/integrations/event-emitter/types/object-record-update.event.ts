import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';

export class ObjectRecordUpdateEvent<T> extends ObjectRecordBaseEvent {
  details: {
    before: T;
    after: T;
    diff?: Partial<T>;
  };
}
