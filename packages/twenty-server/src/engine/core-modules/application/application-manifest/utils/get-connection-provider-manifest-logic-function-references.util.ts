import {
  type ConnectionProviderManifest,
  resolveManifestReferenceUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type ConnectionProviderLogicFunctionHook =
  | 'identifyAccount'
  | 'onConnect'
  | 'onDisconnect'
  | 'authorize'
  | 'callback';

export const getConnectionProviderManifestLogicFunctionReferences = (
  connectionProvider: ConnectionProviderManifest,
): {
  hook: ConnectionProviderLogicFunctionHook;
  universalIdentifier: string;
}[] => {
  const custom =
    connectionProvider.type === 'custom'
      ? connectionProvider.custom
      : undefined;

  const references: {
    hook: ConnectionProviderLogicFunctionHook;
    universalIdentifier: string | undefined;
  }[] = [
    {
      hook: 'identifyAccount',
      universalIdentifier: resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          connectionProvider.identifyAccountLogicFunctionUniversalIdentifier,
        deprecatedReference: connectionProvider.identifyAccountLogicFunction,
      }),
    },
    {
      hook: 'onConnect',
      universalIdentifier: resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          connectionProvider.onConnectLogicFunctionUniversalIdentifier,
        deprecatedReference: connectionProvider.onConnectLogicFunction,
      }),
    },
    {
      hook: 'onDisconnect',
      universalIdentifier: resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          connectionProvider.onDisconnectLogicFunctionUniversalIdentifier,
        deprecatedReference: connectionProvider.onDisconnectLogicFunction,
      }),
    },
    {
      hook: 'authorize',
      universalIdentifier: resolveManifestReferenceUniversalIdentifier({
        universalIdentifier: custom?.authorizeLogicFunctionUniversalIdentifier,
        deprecatedReference: custom?.authorizeLogicFunction,
      }),
    },
    {
      hook: 'callback',
      universalIdentifier: resolveManifestReferenceUniversalIdentifier({
        universalIdentifier: custom?.callbackLogicFunctionUniversalIdentifier,
        deprecatedReference: custom?.callbackLogicFunction,
      }),
    },
  ];

  return references.flatMap(({ hook, universalIdentifier }) =>
    isDefined(universalIdentifier) ? [{ hook, universalIdentifier }] : [],
  );
};
