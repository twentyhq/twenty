import {
  type ConnectionProviderManifest,
  type SyncableEntityOptions,
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
    reference: SyncableEntityOptions | undefined;
  }[] = [
    {
      hook: 'identifyAccount',
      reference: connectionProvider.identifyAccountLogicFunction,
    },
    { hook: 'onConnect', reference: connectionProvider.onConnectLogicFunction },
    {
      hook: 'onDisconnect',
      reference: connectionProvider.onDisconnectLogicFunction,
    },
    { hook: 'authorize', reference: custom?.authorizeLogicFunction },
    { hook: 'callback', reference: custom?.callbackLogicFunction },
  ];

  return references.flatMap(({ hook, reference }) =>
    isDefined(reference)
      ? [{ hook, universalIdentifier: reference.universalIdentifier }]
      : [],
  );
};
