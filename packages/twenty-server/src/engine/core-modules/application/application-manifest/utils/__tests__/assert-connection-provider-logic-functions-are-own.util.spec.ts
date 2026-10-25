import { type ConnectionProviderManifest } from 'twenty-shared/application';

import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { assertConnectionProviderLogicFunctionsAreOwn } from 'src/engine/core-modules/application/application-manifest/utils/assert-connection-provider-logic-functions-are-own.util';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

const MANIFEST_LOGIC_FUNCTION_IDENTIFIER = 'manifest-logic-function';
const EXISTING_LOGIC_FUNCTION_IDENTIFIER = 'existing-logic-function';
const UNKNOWN_LOGIC_FUNCTION_IDENTIFIER = 'unknown-logic-function';

const buildFlatLogicFunctionMaps = (
  universalIdentifier: string,
): UniversalFlatEntityMaps<SyncableFlatEntity> => ({
  byUniversalIdentifier: {
    [universalIdentifier]: {
      id: `${universalIdentifier}-id`,
      universalIdentifier,
      applicationId: 'application-id',
      workspaceId: 'workspace-id',
    },
  },
});

const buildConnectionProvider = (
  hooks: Pick<
    ConnectionProviderManifest,
    | 'identifyAccountLogicFunction'
    | 'onConnectLogicFunction'
    | 'onDisconnectLogicFunction'
  >,
): ConnectionProviderManifest => ({
  universalIdentifier: 'connection-provider',
  name: 'provider',
  displayName: 'Provider',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://provider.example.com/authorize',
    tokenEndpoint: 'https://provider.example.com/token',
    scopes: [],
    clientIdVariable: 'CLIENT_ID',
    clientSecretVariable: 'CLIENT_SECRET',
  },
  ...hooks,
});

const assertHooks = ({
  hooks,
  inferDeletionFromMissingEntities,
}: {
  hooks: Parameters<typeof buildConnectionProvider>[0];
  inferDeletionFromMissingEntities: boolean;
}) =>
  assertConnectionProviderLogicFunctionsAreOwn({
    manifest: { connectionProviders: [buildConnectionProvider(hooks)] },
    fromFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
      EXISTING_LOGIC_FUNCTION_IDENTIFIER,
    ),
    toFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
      MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
    ),
    inferDeletionFromMissingEntities,
  });

describe('assertConnectionProviderLogicFunctionsAreOwn', () => {
  it('accepts hooks that reference a logic function of the manifest', () => {
    expect(() =>
      assertHooks({
        hooks: {
          identifyAccountLogicFunction: {
            universalIdentifier: MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
          },
          onConnectLogicFunction: {
            universalIdentifier: MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
          },
        },
        inferDeletionFromMissingEntities: true,
      }),
    ).not.toThrow();
  });

  it.each([
    'identifyAccountLogicFunction',
    'onConnectLogicFunction',
    'onDisconnectLogicFunction',
  ] as const)(
    'rejects %s when it references a logic function outside the application',
    (hook) => {
      expect(() =>
        assertHooks({
          hooks: {
            [hook]: { universalIdentifier: UNKNOWN_LOGIC_FUNCTION_IDENTIFIER },
          },
          inferDeletionFromMissingEntities: true,
        }),
      ).toThrow(ApplicationException);
    },
  );

  it.each(['authorizeLogicFunction', 'callbackLogicFunction'] as const)(
    'rejects a custom provider whose %s references a logic function outside the application',
    (logicFunctionKey) => {
      const custom = {
        authorizeLogicFunction: {
          universalIdentifier: MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
        },
        callbackLogicFunction: {
          universalIdentifier: MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
        },
        [logicFunctionKey]: {
          universalIdentifier: UNKNOWN_LOGIC_FUNCTION_IDENTIFIER,
        },
      };

      expect(() =>
        assertConnectionProviderLogicFunctionsAreOwn({
          manifest: {
            connectionProviders: [
              {
                universalIdentifier: 'connection-provider',
                name: 'provider',
                displayName: 'Provider',
                type: 'custom',
                custom,
              },
            ],
          },
          fromFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
            EXISTING_LOGIC_FUNCTION_IDENTIFIER,
          ),
          toFlatLogicFunctionMaps: buildFlatLogicFunctionMaps(
            MANIFEST_LOGIC_FUNCTION_IDENTIFIER,
          ),
          inferDeletionFromMissingEntities: true,
        }),
      ).toThrow(ApplicationException);
    },
  );

  it('accepts an existing logic function of the application on a partial sync', () => {
    expect(() =>
      assertHooks({
        hooks: {
          onDisconnectLogicFunction: {
            universalIdentifier: EXISTING_LOGIC_FUNCTION_IDENTIFIER,
          },
        },
        inferDeletionFromMissingEntities: false,
      }),
    ).not.toThrow();
  });

  it('rejects an existing logic function the sync is about to delete', () => {
    expect(() =>
      assertHooks({
        hooks: {
          onDisconnectLogicFunction: {
            universalIdentifier: EXISTING_LOGIC_FUNCTION_IDENTIFIER,
          },
        },
        inferDeletionFromMissingEntities: true,
      }),
    ).toThrow(ApplicationException);
  });
});
