import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';

export class ObjectRecordUpdateEvent<T> extends ObjectRecordBaseEvent {
  operation = 'updated';
  details: {
    before: T;
    after: T;
  };
}
