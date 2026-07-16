export type SyncSystem = 'DIRECTUS' | string;

export type InboundEvent = {
  system: SyncSystem;
  collection: string;
  recordId: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  data: Record<string, unknown>;
  changedAt: string;
};

export type OutboundProjection = {
  system: SyncSystem;
  collection: string;
  record: Record<string, unknown>;
  projectedAt: string;
};
