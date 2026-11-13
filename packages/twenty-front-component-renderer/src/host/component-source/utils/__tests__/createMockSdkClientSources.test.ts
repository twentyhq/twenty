import { createMockSdkClientSources } from '../createMockSdkClientSources';

const loadModule = (
  source: string,
): {
  CoreApiClient: new () => {
    query: (selection?: Record<string, unknown>) => Promise<unknown>;
    mutation: () => Promise<never>;
  };
  MetadataApiClient: new () => object;
} =>
  new Function(`${source.replace('export class', 'class')}; return {
    CoreApiClient: typeof CoreApiClient === 'undefined' ? undefined : CoreApiClient,
    MetadataApiClient: typeof MetadataApiClient === 'undefined' ? undefined : MetadataApiClient,
  };`)();

describe('createMockSdkClientSources', () => {
  it('returns only the selected fictional record for an ID-filtered query', async () => {
    const { core } = createMockSdkClientSources({
      companies: {
        edges: [
          { node: { id: 'acme', name: 'Acme' } },
          { node: { id: 'nova', name: 'Nova' } },
        ],
        totalCount: 2,
        pageInfo: { hasNextPage: false },
      },
    });
    const client = new (loadModule(core).CoreApiClient)();
    const query = (id: string) => ({
      companies: { __args: { filter: { id: { eq: id } } } },
    });

    expect(await client.query(query('nova'))).toEqual({
      companies: {
        edges: [{ node: { id: 'nova', name: 'Nova' } }],
        totalCount: 1,
        pageInfo: { hasNextPage: false },
      },
    });
    expect(await client.query(query('unknown'))).toMatchObject({
      companies: { edges: [], totalCount: 0 },
    });
    expect(await client.query()).toMatchObject({
      companies: { totalCount: 2 },
    });
  });
  it('returns sample query results without executing embedded strings', async () => {
    const result = {
      companies: {
        edges: [{ node: { name: `"; throw new Error('injected'); //` } }],
      },
    };
    const { core } = createMockSdkClientSources(result);
    const client = new (loadModule(core).CoreApiClient)();

    expect(await client.query()).toEqual(result);
  });

  it('rejects writes and metadata access in previews', async () => {
    const { core, metadata } = createMockSdkClientSources({});
    const client = new (loadModule(core).CoreApiClient)();

    await expect(client.mutation()).rejects.toThrow(
      'Mutations are unavailable',
    );
    expect(() => new (loadModule(metadata).MetadataApiClient)()).toThrow(
      'Metadata API calls are unavailable',
    );
  });
});
