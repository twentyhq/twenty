import { useLocation } from 'react-router-dom';

import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getAiChatPageThreadId } from '@/ai/utils/getAiChatPageThreadId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatPageThreadId = () => {
  const { pathname } = useLocation();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return getAiChatPageThreadId({ pathname, newAiChatThreadId });
};
