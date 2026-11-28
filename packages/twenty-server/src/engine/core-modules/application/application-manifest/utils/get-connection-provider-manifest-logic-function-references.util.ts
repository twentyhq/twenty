import {
  type ConnectionProviderManifest,
  normalizeConnectionProviderManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

type ConnectionProviderLogicFunctionHook =
  | 'identifyAccount'
  | 'onConnect'
  | 'onDisconnect'
  | 'checkConnection'
  | 'authorize'
  | 'callback';

export const getConnectionProviderManifestLogicFunctionReferences = (
  connectionProvider: ConnectionProviderManifest,
): {
  hook: ConnectionProviderLogicFunctionHook;
  universalIdentifier: string;
}[] => {
  const normalizedConnectionProvider =
    normalizeConnectionProviderManifest(connectionProvider);

  const custom =
    normalizedConnectionProvider.type === 'custom'
      ? normalizedConnectionProvider.custom
      : undefined;

  const references: {
    hook: ConnectionProviderLogicFunctionHook;
    universalIdentifier: string | undefined;
  }[] = [
    {
      hook: 'identifyAccount',
      universalIdentifier:
        normalizedConnectionProvider.identifyAccountLogicFunctionUniversalIdentifier,
    },
    {
      hook: 'onConnect',
      universalIdentifier:
        normalizedConnectionProvider.onConnectLogicFunctionUniversalIdentifier,
    },
    {
      hook: 'onDisconnect',
      universalIdentifier:
        normalizedConnectionProvider.onDisconnectLogicFunctionUniversalIdentifier,
    },
    {
      hook: 'checkConnection',
      universalIdentifier:
        normalizedConnectionProvider.checkConnectionLogicFunctionUniversalIdentifier,
    },
    {
      hook: 'authorize',
      universalIdentifier: custom?.authorizeLogicFunctionUniversalIdentifier,
    },
    {
      hook: 'callback',
      universalIdentifier: custom?.callbackLogicFunctionUniversalIdentifier,
    },
  ];

  return references.flatMap(({ hook, universalIdentifier }) =>
    isDefined(universalIdentifier) ? [{ hook, universalIdentifier }] : [],
  );
};
