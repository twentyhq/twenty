import type { AllMetadataName } from 'twenty-shared/metadata';

import {
  type AllMetadataEventType,
  type MetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

export type MetadataEventBatch<
  TMetadataName extends AllMetadataName = AllMetadataName,
  TType extends AllMetadataEventType = AllMetadataEventType,
> = {
  name: `metadata.${TMetadataName}.${TType}`;
  workspaceId: string;
  metadataName: TMetadataName;
  type: TType;
  events: MetadataEvent[];
  userId?: string;
  apiKeyId?: string;
};
