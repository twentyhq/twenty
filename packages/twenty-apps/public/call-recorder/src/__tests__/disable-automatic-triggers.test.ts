import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { disableAutomaticTriggers } from './disable-automatic-triggers';

const { query, mutation } = vi.hoisted(() => ({
  query: vi.fn(),
  mutation: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = query;
    mutation = mutation;
  },
}));

describe('lifecycle trigger isolation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('disables automatic delivery while retaining the deployed functions and app metadata', async () => {
    const logicFunction = {
      universalIdentifier: '22222222-2222-4222-8222-222222222222',
      builtHandlerPath: 'logic-functions/reconcile.mjs',
      builtHandlerChecksum: 'checksum',
      databaseEventTriggerSettings: { eventName: 'calendarEvent.*' },
      cronTriggerSettings: { pattern: '* * * * *' },
      httpRouteTriggerSettings: { path: '/webhook', httpMethod: 'POST' },
    };
    const manifest = {
      application: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      logicFunctions: [logicFunction],
      fields: [{ name: 'callRecorderPreference' }],
    };

    query.mockResolvedValue({ exportApplication: { manifest } });

    await disableAutomaticTriggers();

    expect(query).toHaveBeenCalledWith({
      exportApplication: {
        __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        manifest: true,
      },
    });
    expect(mutation).toHaveBeenCalledWith({
      syncApplication: {
        __args: {
          inferDeletionFromMissingEntities: false,
          manifest: {
            ...manifest,
            logicFunctions: [
              {
                ...logicFunction,
                databaseEventTriggerSettings: null,
                cronTriggerSettings: null,
              },
            ],
          },
        },
        applicationUniversalIdentifier: true,
      },
    });
    expect(logicFunction.databaseEventTriggerSettings).toEqual({
      eventName: 'calendarEvent.*',
    });
  });

  it.each([undefined, [null]])(
    'does not sync an invalid function list: %j',
    async (logicFunctions) => {
      query.mockResolvedValue({
        exportApplication: { manifest: { logicFunctions } },
      });

      await expect(disableAutomaticTriggers()).rejects.toThrow();
      expect(mutation).not.toHaveBeenCalled();
    },
  );
});
