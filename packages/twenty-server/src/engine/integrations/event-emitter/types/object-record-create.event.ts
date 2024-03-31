import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';

export class ObjectRecordCreateEvent<T> extends ObjectRecordBaseEvent {
  details: {
    after: T;
  };
}
