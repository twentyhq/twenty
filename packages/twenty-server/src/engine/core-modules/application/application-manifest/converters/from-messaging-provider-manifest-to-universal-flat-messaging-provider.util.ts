import { type MessagingProviderManifest } from 'twenty-shared/application';

import { type UniversalFlatMessagingProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-messaging-provider.type';

export const fromMessagingProviderManifestToUniversalFlatMessagingProvider = ({
  messagingProviderManifest,
  applicationUniversalIdentifier,
  now,
}: {
  messagingProviderManifest: MessagingProviderManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatMessagingProvider => ({
  universalIdentifier: messagingProviderManifest.universalIdentifier,
  applicationUniversalIdentifier,
  name: messagingProviderManifest.name,
  displayName: messagingProviderManifest.displayName,
  connectionProviderUniversalIdentifier:
    messagingProviderManifest.connectionProvider.universalIdentifier,
  sendMessageLogicFunctionUniversalIdentifier:
    messagingProviderManifest.sendMessageLogicFunction?.universalIdentifier ??
    null,
  createdAt: now,
  updatedAt: now,
});
