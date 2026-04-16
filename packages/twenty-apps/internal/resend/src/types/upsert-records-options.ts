import type { CoreApiClient } from 'twenty-client-sdk/core';

export type UpsertRecordsOptions<TListItem, TDetail = TListItem> = {
  items: TListItem[];
  getId: (item: TListItem) => string;
  fetchDetail?: (id: string) => Promise<TDetail>;
  mapCreateData: (detail: TDetail, item: TListItem) => Record<string, unknown>;
  mapUpdateData: (item: TListItem) => Record<string, unknown>;
  existingMap: Map<string, string>;
  client: CoreApiClient;
  objectNameSingular: string;
};
