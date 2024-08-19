import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export class ObjectRecordBaseEvent {
  recordId: string;
  userId?: string;
  workspaceMemberId?: string;
  objectMetadata: ObjectMetadataInterface;
  properties: any;
}

export class ObjectRecordBaseEventWithNameAndWorkspaceId extends ObjectRecordBaseEvent {
  name: string;
  workspaceId: string;
}
