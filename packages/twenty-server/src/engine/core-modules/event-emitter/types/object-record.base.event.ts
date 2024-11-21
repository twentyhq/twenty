import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export class ObjectRecordBaseEvent {
  recordId: string;
  userId?: string;
  workspaceMemberId?: string;
  objectMetadata: ObjectMetadataInterface;
  properties: any;

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
