import type { CoreApiClient } from 'twenty-client-sdk/core';

export type UpsertRecordsOptions<
  TListItem,
  TCreateDto extends Record<string, unknown> = Record<string, unknown>,
  TUpdateDto extends Record<string, unknown> = Record<string, unknown>,
> = {
  items: TListItem[];
  getId: (item: TListItem) => string;
  mapCreateData: (detail: TListItem, item: TListItem) => TCreateDto;
  mapUpdateData: (detail: TListItem, item: TListItem) => TUpdateDto;
  client: CoreApiClient;
  objectNameSingular: string;
  objectNamePlural: string;
};
