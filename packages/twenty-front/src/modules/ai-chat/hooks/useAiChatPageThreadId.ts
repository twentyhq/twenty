import { useLocation } from 'react-router-dom';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatPageThreadId = () => {
  const { pathname } = useLocation();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return getAiChatPageThreadId({ pathname, newAiChatThreadId });
};
