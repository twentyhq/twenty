import { useLocation } from 'react-router-dom';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatPageThreadId = () => {
  const { pathname } = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return getAiChatPageThreadId({
    pathname,
    newAiChatThreadId,
    inboxRecordRouteObjectNames,
  });
};
