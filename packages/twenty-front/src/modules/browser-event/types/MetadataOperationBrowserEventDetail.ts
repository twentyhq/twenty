import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type BroadcastEntityName } from '@/browser-event/types/BroadcastEntityName';

// TODO: The browser event layer currently uses "Metadata" naming throughout
// (MetadataOperation, MetadataOperationBrowserEventDetail, etc.) because it
// originally only carried events for syncable metadata entities (views, fields,
// etc.). With WorkspaceEventBroadcaster, non-syncable entities like
// agentChatThread also broadcast through the same SSE stream.
// BroadcastEntityName captures this distinction at the type level, but the
// naming of the surrounding types/hooks/files still says "Metadata." A future
// rename of this layer (e.g. Metadata* → Entity* or Broadcast*) would make
// the naming consistent with the actual scope.
export type MetadataOperationBrowserEventDetail<
  T extends Record<string, unknown>,
> = {
  metadataName: BroadcastEntityName;
  operation: MetadataOperation<T>;
  updatedCollectionHash?: string;
};
