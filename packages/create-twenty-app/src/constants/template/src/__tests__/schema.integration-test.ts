import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

import { core, isCoreClientAvailable, metadata } from './helpers/client';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = metadata();

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

describe('CoreApiClient', () => {
  it.skipIf(!isCoreClientAvailable())(
    'should support CRUD on standard objects',
    async () => {
      const client = core();

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
    },
  );
});
