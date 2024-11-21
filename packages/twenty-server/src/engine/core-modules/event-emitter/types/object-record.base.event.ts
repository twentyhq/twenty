import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

type Diff<T> = {
  [K in keyof T]: { before: T[K]; after: T[K] };
};

type Properties<T> = {
  updatedFields?: string[];
  before?: T;
  after?: T;
  diff?: Partial<Diff<T>>;
};

export class ObjectRecordBaseEvent<T> {
  recordId: string;
  userId?: string;
  workspaceMemberId?: string;
  objectMetadata: ObjectMetadataInterface;
  properties: Properties<T>;

  constructor({
    recordId,
    objectMetadata,
    properties,
    userId,
    workspaceMemberId,
  }: {
    recordId: string;
    objectMetadata: ObjectMetadataInterface;
    properties: any;
    userId?: string;
    workspaceMemberId?: string;
  }) {
    this.recordId = recordId;
    this.objectMetadata = objectMetadata;
    this.properties = properties;
    this.userId = userId;
    this.workspaceMemberId = workspaceMemberId;
  }
}
