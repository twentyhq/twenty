import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

export class ObjectRecordUpdateEvent<T extends BaseObjectMetadata> {
  workspaceId: string;
  previousRecord: T;
  updatedRecord: T;
}
