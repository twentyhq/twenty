import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';

export class ObjectRecordDeleteEvent<T> extends ObjectRecordBaseEvent {
  details: {
    before: T;
  };
}
