import { type ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';

type Properties<T> = {
  updatedFields?: string[];
  before?: T;
  after?: T;
  diff?: Partial<ObjectRecordDiff<T>>;
};

export class ObjectRecordBaseEvent<T = object> {
  recordId: string;
  userId?: string;
  workspaceMemberId?: string;
  properties: Properties<T>;
}
