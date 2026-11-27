import { type SdkClientSources } from '@/types/SdkClientSources';

export const createMockSdkClientSources = (
  queryResult: Record<string, unknown>,
): SdkClientSources => ({
  core: `export class CoreApiClient {
    async query(selection) {
      const result = ${JSON.stringify(queryResult)};
      for (const [name, query] of Object.entries(selection ?? {})) {
        const recordId = query?.__args?.filter?.id?.eq;
        const connection = result[name];
        if (typeof recordId === 'string' && Array.isArray(connection?.edges)) {
          connection.edges = connection.edges.filter(({ node }) => node.id === recordId);
          connection.totalCount = connection.edges.length;
        }
      }
      return result;
    }
    async mutation() { throw new Error('Mutations are unavailable in previews.'); }
  }`,
  metadata: `export class MetadataApiClient {
    constructor() { throw new Error('Metadata API calls are unavailable in previews.'); }
  }`,
});
