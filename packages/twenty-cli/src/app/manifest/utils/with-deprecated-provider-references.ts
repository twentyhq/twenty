import {
  type ConnectionProviderManifest,
  type McpServerManifest,
  type MessagingProviderManifest,
  normalizeConnectionProviderManifest,
  normalizeMcpServerManifest,
  normalizeMessagingProviderManifest,
  type SyncableEntityOptions,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Servers before 2.63 only read the deprecated { universalIdentifier } references, so the built manifest carries both.
const toDeprecatedReference = (
  universalIdentifier: string | undefined,
): SyncableEntityOptions | undefined =>
  isDefined(universalIdentifier) ? { universalIdentifier } : undefined;

export const withDeprecatedConnectionProviderReferences = (
  connectionProviderManifest: ConnectionProviderManifest,
): ConnectionProviderManifest => {
  const normalizedManifest = normalizeConnectionProviderManifest(
    connectionProviderManifest,
  );

  const manifestWithDeprecatedReferences: ConnectionProviderManifest = {
    ...normalizedManifest,
    identifyAccountLogicFunction: toDeprecatedReference(
      normalizedManifest.identifyAccountLogicFunctionUniversalIdentifier,
    ),
    onConnectLogicFunction: toDeprecatedReference(
      normalizedManifest.onConnectLogicFunctionUniversalIdentifier,
    ),
    onDisconnectLogicFunction: toDeprecatedReference(
      normalizedManifest.onDisconnectLogicFunctionUniversalIdentifier,
    ),
  };

  if (
    manifestWithDeprecatedReferences.type !== 'custom' ||
    !isDefined(manifestWithDeprecatedReferences.custom)
  ) {
    return manifestWithDeprecatedReferences;
  }

  const { custom } = manifestWithDeprecatedReferences;

  return {
    ...manifestWithDeprecatedReferences,
    custom: {
      ...custom,
      authorizeLogicFunction: toDeprecatedReference(
        custom.authorizeLogicFunctionUniversalIdentifier,
      ),
      callbackLogicFunction: toDeprecatedReference(
        custom.callbackLogicFunctionUniversalIdentifier,
      ),
    },
  };
};

export const withDeprecatedMessagingProviderReferences = (
  messagingProviderManifest: MessagingProviderManifest,
): MessagingProviderManifest => {
  const normalizedManifest = normalizeMessagingProviderManifest(
    messagingProviderManifest,
  );

  return {
    ...normalizedManifest,
    connectionProvider: toDeprecatedReference(
      normalizedManifest.connectionProviderUniversalIdentifier,
    ),
    sendMessageLogicFunction: toDeprecatedReference(
      normalizedManifest.sendMessageLogicFunctionUniversalIdentifier,
    ),
    markThreadAsReadLogicFunction: toDeprecatedReference(
      normalizedManifest.markThreadAsReadLogicFunctionUniversalIdentifier,
    ),
  };
};

export const withDeprecatedMcpServerReferences = (
  mcpServerManifest: McpServerManifest,
): McpServerManifest => {
  const normalizedManifest = normalizeMcpServerManifest(mcpServerManifest);

  return {
    ...normalizedManifest,
    connectionProvider: toDeprecatedReference(
      normalizedManifest.connectionProviderUniversalIdentifier,
    ),
  };
};
