import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { buildResultSchema } from './build-result-schema';
import { disableAutomaticTriggersOrThrow } from './disable-automatic-triggers-or-throw';

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

const logicFunction = {
  universalIdentifier: '22222222-2222-4222-8222-222222222222',
  builtHandlerPath: 'logic-functions/reconcile.mjs',
  builtHandlerChecksum: 'checksum',
  databaseEventTriggerSettings: { eventName: 'calendarEvent.*' },
  cronTriggerSettings: { pattern: '* * * * *' },
  httpRouteTriggerSettings: { path: '/webhook', httpMethod: 'POST' },
};
const manifest = {
  application: {
    universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    name: 'Call recorder',
  },
  logicFunctions: [logicFunction],
  fields: [{ name: 'callRecorderPreference' }],
};
const installedFunction = {
  ...logicFunction,
  applicationId: 'call-recorder',
  databaseEventTriggerSettings: null,
  cronTriggerSettings: null,
};

type InstalledFunction = {
  applicationId: string;
  universalIdentifier: string;
  databaseEventTriggerSettings:
    | typeof logicFunction.databaseEventTriggerSettings
    | null;
  cronTriggerSettings: typeof logicFunction.cronTriggerSettings | null;
};

const mockInstalledFunctions = (logicFunctions: InstalledFunction[]) => {
  query.mockResolvedValue({
    findOneApplication: { id: 'call-recorder' },
    findManyLogicFunctions: logicFunctions,
  });
};

describe('lifecycle trigger isolation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockInstalledFunctions([installedFunction]);
  });

  it('disables and verifies automatic delivery while preserving the built handlers', async () => {
    mockInstalledFunctions([
      installedFunction,
      { ...logicFunction, applicationId: 'another-app' },
    ]);

    await disableAutomaticTriggersOrThrow(
      buildResultSchema.parse({ manifest }).manifest,
    );

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
    expect(query).toHaveBeenCalledWith({
      findOneApplication: {
        __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
        id: true,
      },
      findManyLogicFunctions: {
        applicationId: true,
        universalIdentifier: true,
        databaseEventTriggerSettings: true,
        cronTriggerSettings: true,
      },
    });
    expect(logicFunction.databaseEventTriggerSettings).toEqual({
      eventName: 'calendarEvent.*',
    });
  });

  it.each(
    [undefined, [], [null]].map((logicFunctions) => ({ logicFunctions })),
  )('rejects incomplete manifests before syncing: %j', ({ logicFunctions }) => {
    expect(() =>
      buildResultSchema.parse({ manifest: { ...manifest, logicFunctions } }),
    ).toThrow();
    expect(mutation).not.toHaveBeenCalled();
  });

  it('rejects a manifest belonging to another app', () => {
    expect(() =>
      buildResultSchema.parse({
        manifest: {
          ...manifest,
          application: { universalIdentifier: 'another-app' },
        },
      }),
    ).toThrow();
    expect(mutation).not.toHaveBeenCalled();
  });

  it.each(
    [
      [],
      [{ ...installedFunction, universalIdentifier: 'unexpected-function' }],
      [
        {
          ...installedFunction,
          databaseEventTriggerSettings: { eventName: 'calendarEvent.*' },
        },
      ],
      [{ ...installedFunction, cronTriggerSettings: { pattern: '* * * * *' } }],
    ].map((functions) => ({ functions })),
  )(
    'fails setup if the installed functions remain unsafe: %j',
    async ({ functions }) => {
      mockInstalledFunctions(functions);

      await expect(
        disableAutomaticTriggersOrThrow(
          buildResultSchema.parse({ manifest }).manifest,
        ),
      ).rejects.toThrow('Automatic triggers were not disabled');
    },
  );
});
