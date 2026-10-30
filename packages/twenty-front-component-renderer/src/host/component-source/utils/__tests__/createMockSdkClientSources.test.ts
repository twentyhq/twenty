import { createMockSdkClientSources } from '../createMockSdkClientSources';

const loadModule = (source: string) =>
  new Function(`${source.replace('export class', 'class')}; return {
    CoreApiClient: typeof CoreApiClient === 'undefined' ? undefined : CoreApiClient,
    MetadataApiClient: typeof MetadataApiClient === 'undefined' ? undefined : MetadataApiClient,
  };`)() as {
    CoreApiClient: new () => {
      query: () => Promise<unknown>;
      mutation: () => Promise<never>;
    };
    MetadataApiClient: new () => object;
  };

describe('createMockSdkClientSources', () => {
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
