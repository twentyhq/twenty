import { useLocation } from 'react-router-dom';

import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { matchInboxPath } from '@/ai-chat/utils/matchInboxPath';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxRouteThreadId = () => {
  const { pathname } = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );

  return matchInboxPath({ pathname, inboxRecordRouteObjectNames })?.threadId;
};
