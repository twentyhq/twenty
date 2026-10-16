import { isObject } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const disableAutomaticTriggers = async () => {
  const client = new MetadataApiClient();
  const { exportApplication } = await client.query({
    exportApplication: {
      __args: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
      manifest: true,
    },
  });
  const manifest = exportApplication.manifest;

  if (!Array.isArray(manifest.logicFunctions)) {
    throw new Error('The installed app manifest has no logic functions');
  }

  // Lifecycle tests deliver triggers themselves. Keep the worker available
  // for explicit queue tests without letting automatic jobs race the fixtures.
  await client.mutation({
    syncApplication: {
      __args: {
        inferDeletionFromMissingEntities: false,
        manifest: {
          ...manifest,
          logicFunctions: manifest.logicFunctions.map(
            (logicFunction: unknown) => {
              if (!isObject(logicFunction)) {
                throw new Error(
                  'Invalid logic function in the installed app manifest',
                );
              }

              return {
                ...logicFunction,
                databaseEventTriggerSettings: null,
                cronTriggerSettings: null,
              };
            },
          ),
        },
      },
      applicationUniversalIdentifier: true,
    },
  });
};
