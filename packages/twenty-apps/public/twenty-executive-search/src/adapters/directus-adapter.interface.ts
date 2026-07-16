import type {
  InboundEvent,
  OutboundProjection,
  SyncSystem,
} from 'src/adapters/sync-adapter.types';

export type FetchChangedRecordsArgs = {
  since?: string;
  collections?: string[];
};

export interface DirectusAdapter {
  readonly system: SyncSystem;

  fetchChangedRecords(
    args: FetchChangedRecordsArgs,
  ): Promise<InboundEvent[]>;

  project(record: Record<string, unknown>): Promise<OutboundProjection>;
}

export class DirectusAdapterImpl implements DirectusAdapter {
  readonly system: SyncSystem = 'DIRECTUS';

  async fetchChangedRecords(
    _args: FetchChangedRecordsArgs,
  ): Promise<InboundEvent[]> {
    throw new Error('Not implemented');
  }

  async project(
    _record: Record<string, unknown>,
  ): Promise<OutboundProjection> {
    throw new Error('Not implemented');
  }
}
