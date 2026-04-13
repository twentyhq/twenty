import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application.config';
import { describe, expect, it } from 'vitest';

import { createPostCard, deletePostCard } from './helpers/mutations';

function isCoreClientAvailable(): boolean {
  try {
    new CoreApiClient();
    return true;
  } catch {
    return false;
  }
}

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
          paging: { first: 1000 },
          filter: { nameSingular: { eq: 'postCard' } },
        },
        edges: {
          node: {
            nameSingular: true,
            fields: {
              edges: { node: { name: true } },
            },
          },
        },
      },
    });

    const obj = objects.edges[0]?.node;
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

  it.skipIf(!isCoreClientAvailable())(
    'should support CRUD via GraphQL',
    async () => {
      const id = await createPostCard({
        name: 'Schema test postcard',
        content: 'Hello from integration tests',
      });
      expect(id).toBeDefined();
      await deletePostCard(id);
    },
  );
});
