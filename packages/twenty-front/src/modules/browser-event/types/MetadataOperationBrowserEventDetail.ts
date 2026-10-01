import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type BroadcastEntityName } from '@/browser-event/types/BroadcastEntityName';

// TODO: rename this layer (Metadata* -> Broadcast*): it now also carries non-syncable entities.
export type MetadataOperationBrowserEventDetail<
  T extends Record<string, unknown>,
> = {
  metadataName: BroadcastEntityName;
  operation: MetadataOperation<T>;
  updatedCollectionHash?: string;
};
