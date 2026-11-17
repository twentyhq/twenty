import { useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';

export const useAiChatInstance = () => {
  const aiChatInstance = useContext(AiChatInstanceContext);

  if (!isDefined(aiChatInstance)) {
    throw new Error(
      doNotTranslate('useAiChatInstance must be used inside an AiChatInstance'),
    );
  }

  return aiChatInstance;
};
