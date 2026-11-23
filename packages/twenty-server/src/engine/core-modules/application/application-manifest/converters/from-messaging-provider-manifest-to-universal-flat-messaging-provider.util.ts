import {
  type MessagingProviderManifest,
  resolveManifestReferenceUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

import { type UniversalFlatMessagingProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-messaging-provider.type';

export const fromMessagingProviderManifestToUniversalFlatMessagingProvider = ({
  messagingProviderManifest,
  applicationUniversalIdentifier,
  now,
}: {
  messagingProviderManifest: MessagingProviderManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatMessagingProvider => {
  const connectionProviderUniversalIdentifier =
    resolveManifestReferenceUniversalIdentifier({
      universalIdentifier:
        messagingProviderManifest.connectionProviderUniversalIdentifier,
      deprecatedReference: messagingProviderManifest.connectionProvider,
    });

  if (!isDefined(connectionProviderUniversalIdentifier)) {
    throw new ApplicationException(
      `Messaging provider ${messagingProviderManifest.universalIdentifier} must declare connectionProviderUniversalIdentifier`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    universalIdentifier: messagingProviderManifest.universalIdentifier,
    applicationUniversalIdentifier,
    name: messagingProviderManifest.name,
    displayName: messagingProviderManifest.displayName,
    connectionProviderUniversalIdentifier,
    sendMessageLogicFunctionUniversalIdentifier:
      resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          messagingProviderManifest.sendMessageLogicFunctionUniversalIdentifier,
        deprecatedReference: messagingProviderManifest.sendMessageLogicFunction,
      }) ?? null,
    markThreadAsReadLogicFunctionUniversalIdentifier:
      resolveManifestReferenceUniversalIdentifier({
        universalIdentifier:
          messagingProviderManifest.markThreadAsReadLogicFunctionUniversalIdentifier,
        deprecatedReference:
          messagingProviderManifest.markThreadAsReadLogicFunction,
      }) ?? null,
    conversationStyle: messagingProviderManifest.conversationStyle ?? null,
    createdAt: now,
    updatedAt: now,
  };
};
