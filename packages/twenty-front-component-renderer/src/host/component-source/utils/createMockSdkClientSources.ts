import { type SdkClientSources } from '@/types/SdkClientSources';

export const createMockSdkClientSources = (
  queryResult: Record<string, unknown>,
): SdkClientSources => ({
  core: `export class CoreApiClient {
    async query() { return ${JSON.stringify(queryResult)}; }
    async mutation() { throw new Error('Mutations are unavailable in previews.'); }
  }`,
  metadata: `export class MetadataApiClient {
    constructor() { throw new Error('Metadata API calls are unavailable in previews.'); }
  }`,
});
