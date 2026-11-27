import {
  type MessagingProviderManifest,
  normalizeMessagingProviderManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type UniversalFlatMessagingProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-messaging-provider.type';

export const fromMessagingProviderManifestToUniversalFlatMessagingProviderOrThrow =
  ({
    messagingProviderManifest,
    applicationUniversalIdentifier,
    now,
  }: {
    messagingProviderManifest: MessagingProviderManifest;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatMessagingProvider => {
    const {
      universalIdentifier,
      name,
      displayName,
      connectionProviderUniversalIdentifier,
      sendMessageLogicFunctionUniversalIdentifier,
      markThreadAsReadLogicFunctionUniversalIdentifier,
      startConversationLogicFunctionUniversalIdentifier,
      conversationStyle,
    } = normalizeMessagingProviderManifest(messagingProviderManifest);

    if (!isDefined(connectionProviderUniversalIdentifier)) {
      throw new ApplicationException(
        `Messaging provider ${universalIdentifier} must declare connectionProviderUniversalIdentifier`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return {
      universalIdentifier,
      applicationUniversalIdentifier,
      name,
      displayName,
      connectionProviderUniversalIdentifier,
      sendMessageLogicFunctionUniversalIdentifier:
        sendMessageLogicFunctionUniversalIdentifier ?? null,
      markThreadAsReadLogicFunctionUniversalIdentifier:
        markThreadAsReadLogicFunctionUniversalIdentifier ?? null,
      startConversationLogicFunctionUniversalIdentifier:
        startConversationLogicFunctionUniversalIdentifier ?? null,
      conversationStyle: conversationStyle ?? null,
      createdAt: now,
      updatedAt: now,
    };
  };
