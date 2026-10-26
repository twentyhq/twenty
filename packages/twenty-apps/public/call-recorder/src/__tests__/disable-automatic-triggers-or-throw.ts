import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import { type BuildManifest } from './build-result-schema';

export const disableAutomaticTriggersOrThrow = async (
  manifest: BuildManifest,
) => {
  const logicFunctions = manifest.logicFunctions.map((logicFunction) => ({
    ...logicFunction,
    databaseEventTriggerSettings: null,
    cronTriggerSettings: null,
  }));
  const client = new MetadataApiClient();

  // Automatic worker jobs would race the fixtures managed by these tests.
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
