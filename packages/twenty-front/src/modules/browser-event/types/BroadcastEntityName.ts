import { type AllMetadataName } from 'twenty-shared/metadata';

// Broadcast through WorkspaceEventBroadcaster but absent from ALL_METADATA_NAME.
const ALL_NON_SYNCABLE_BROADCAST_ENTITY_NAME = {
  application: 'application',
  applicationRegistration: 'applicationRegistration',
  messageChannel: 'messageChannel',
} as const;

type NonSyncableBroadcastEntityName =
  keyof typeof ALL_NON_SYNCABLE_BROADCAST_ENTITY_NAME;

export type BroadcastEntityName =
  | AllMetadataName
  | NonSyncableBroadcastEntityName;
