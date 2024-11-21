import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export type ObjectRecordDiff<T> = {
  [K in keyof T]: { before: T[K]; after: T[K] };
};

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
  objectMetadata: ObjectMetadataInterface;
  properties: Properties<T>;
}
