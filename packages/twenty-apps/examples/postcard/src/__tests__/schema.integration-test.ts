import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application.config';
import { describe, expect, it } from 'vitest';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const app = result.findManyApplications.find(
      (a: { universalIdentifier: string }) =>
        a.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(app).toBeDefined();
  });
});

describe('PostCard object', () => {
  it('should exist with expected fields and relations', async () => {
    const client = new MetadataApiClient();

    const { objects } = await client.query({
      objects: {
        __args: {
          filter: { isCustom: { is: true } },
          paging: { first: 50 },
        },
        edges: {
          node: {
            nameSingular: true,
            fields: {
              __args: { paging: { first: 500 } },
              edges: { node: { name: true } },
            },
          },
        },
      },
    });

    const obj = objects.edges
      .map((e: { node: { nameSingular: string } }) => e.node)
      .find((n: { nameSingular: string }) => n.nameSingular === 'postCard');
    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map(
      (e: { node: { name: string } }) => e.node.name,
    );
    expect(names).toContain('name');
    expect(names).toContain('content');
    expect(names).toContain('status');
    expect(names).toContain('deliveredAt');
    expect(names).toContain('recipient');
  });

});
