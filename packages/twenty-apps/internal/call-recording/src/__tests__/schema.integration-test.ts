import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import applicationConfig from 'src/application-config';
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
        a.universalIdentifier === applicationConfig.config.universalIdentifier,
    );

    expect(app).toBeDefined();
  });
});

describe('CoreApiClient', () => {
  it('should support CRUD on standard objects', async () => {
    const client = new CoreApiClient();

    const created = await client.mutation({
      createNote: {
        __args: { data: { title: 'Integration test note' } },
        id: true,
      },
    });
    expect(created.createNote.id).toBeDefined();

    await client.mutation({
      destroyNote: {
        __args: { id: created.createNote.id },
        id: true,
      },
    });
  });
});
