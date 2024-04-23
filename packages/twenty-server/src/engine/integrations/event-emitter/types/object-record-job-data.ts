import { ObjectRecordBaseEvent } from 'src/engine/integrations/event-emitter/types/object-record.base.event';

export class ObjectRecordJobData extends ObjectRecordBaseEvent {
  getOperation() {
    return this.name.split('.')[1];
  }

  getObjectName() {
    return this.name.split('.')[0];
  }
}
