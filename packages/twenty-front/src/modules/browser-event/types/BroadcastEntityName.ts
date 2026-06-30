import { type AllMetadataName } from 'twenty-shared/metadata';

// Non-syncable entities that broadcast real-time events through the SSE
// event stream via WorkspaceEventBroadcaster, but are NOT part of the
// workspace migration / syncable entity system (ALL_METADATA_NAME).
const ALL_NON_SYNCABLE_BROADCAST_ENTITY_NAME = {
  agentChatThread: 'agentChatThread',
} as const;

type NonSyncableBroadcastEntityName =
  keyof typeof ALL_NON_SYNCABLE_BROADCAST_ENTITY_NAME;

export type BroadcastEntityName =
  | AllMetadataName
  | NonSyncableBroadcastEntityName;
