import { isNonEmptyString, isObject } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const disableAutomaticTriggers = async (manifest: unknown) => {
  if (
    !isObject(manifest) ||
    !('application' in manifest) ||
    !isObject(manifest.application) ||
    !('universalIdentifier' in manifest.application) ||
    manifest.application.universalIdentifier !==
      APPLICATION_UNIVERSAL_IDENTIFIER ||
    !('logicFunctions' in manifest) ||
    !Array.isArray(manifest.logicFunctions) ||
    manifest.logicFunctions.length === 0
  ) {
    throw new Error('Expected a full call-recorder build manifest');
  }

  const logicFunctions = manifest.logicFunctions.map(
    (logicFunction: unknown) => {
      if (
        !isObject(logicFunction) ||
        !('universalIdentifier' in logicFunction) ||
        !isNonEmptyString(logicFunction.universalIdentifier)
      ) {
        throw new Error('Invalid logic function in the build manifest');
      }

      return {
        ...logicFunction,
        universalIdentifier: logicFunction.universalIdentifier,
        databaseEventTriggerSettings: null,
        cronTriggerSettings: null,
      };
    },
  );
  const client = new MetadataApiClient();

  // Lifecycle tests deliver triggers themselves. Keep the worker available
  // for explicit queue tests without letting automatic jobs race the fixtures.
  await client.mutation({
    syncApplication: {
      __args: {
        inferDeletionFromMissingEntities: false,
        manifest: { ...manifest, logicFunctions },
      },
      applicationUniversalIdentifier: true,
    },
  });

  const { findOneApplication: application, findManyLogicFunctions } =
    await client.query({
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
  const installedFunctions = findManyLogicFunctions.filter(
    (logicFunction) => logicFunction.applicationId === application.id,
  );
  const expectedIdentifiers = new Set(
    logicFunctions.map((logicFunction) => logicFunction.universalIdentifier),
  );

  if (
    installedFunctions.length !== expectedIdentifiers.size ||
    installedFunctions.some(
      (logicFunction) =>
        !isDefined(logicFunction.universalIdentifier) ||
        !expectedIdentifiers.has(logicFunction.universalIdentifier) ||
        isDefined(logicFunction.databaseEventTriggerSettings) ||
        isDefined(logicFunction.cronTriggerSettings),
    )
  ) {
    throw new Error(
      'Automatic triggers were not disabled for all call-recorder logic functions',
    );
  }
};
