import { isNonEmptyString } from '@sniptt/guards';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const validateAgentChatChannelNameOrThrow = (name: string): string => {
  const trimmedName = name.trim();

  if (!isNonEmptyString(trimmedName)) {
    throw new AiException(
      'A channel needs a name',
      AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
    );
  }

  return trimmedName;
};
