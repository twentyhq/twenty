import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export class ObjectRecordBaseEvent {
  name: string;
  workspaceId: string;
  recordId: string;
  userId?: string;
  workspaceMemberId?: string;
  objectMetadata: ObjectMetadataInterface;
  properties: any;
}
