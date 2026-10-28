import { isValidUniversalIdentifier } from 'twenty-shared/application';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const validateAgentChatChannelUniversalIdentifierOrThrow = (
  universalIdentifier: string,
): string => {
  const lowerCasedUniversalIdentifier = universalIdentifier.toLowerCase();

  if (!isValidUniversalIdentifier(lowerCasedUniversalIdentifier)) {
    throw new AiException(
      'A channel universal identifier must be a UUID v4 or later',
      AiExceptionCode.INVALID_CHAT_CHANNEL_UNIVERSAL_IDENTIFIER,
    );
  }

  return lowerCasedUniversalIdentifier;
};
