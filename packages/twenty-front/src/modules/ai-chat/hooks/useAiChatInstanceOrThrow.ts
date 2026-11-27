import { useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';

export const useAiChatInstanceOrThrow = () => {
  const aiChatInstance = useContext(AiChatInstanceContext);

  if (!isDefined(aiChatInstance)) {
    throw new CustomError(
      doNotTranslate(
        'useAiChatInstanceOrThrow must be used inside an AiChatInstance',
      ),
      'AI_CHAT_INSTANCE_NOT_FOUND',
    );
  }

  return aiChatInstance;
};
