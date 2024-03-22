import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export class ObjectRecordBaseEvent {
  workspaceId: string;
  recordId: string;
  userId?: string;
  objectMetadata: ObjectMetadataInterface;
  details: any;
}
