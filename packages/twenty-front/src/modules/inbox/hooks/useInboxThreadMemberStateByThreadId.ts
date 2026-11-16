import { useLocation } from 'react-router-dom';

import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { inboxThreadMemberStateByThreadIdFamilySelector } from '@/inbox/states/selectors/inboxThreadMemberStateByThreadIdFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isInboxPath } from '~/utils/isInboxPath';

export const useInboxThreadMemberStateByThreadId = ({
  threadIds,
  channelIdOutsideInbox,
}: {
  threadIds: string[];
  channelIdOutsideInbox?: string | null;
}) => {
  const location = useLocation();
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const channelId = isInboxPath(location.pathname)
    ? (inboxSelectedChannelView?.channelId ?? null)
    : (channelIdOutsideInbox ?? null);
  const inboxThreadMemberStateByThreadId = useAtomFamilySelectorValue(
    inboxThreadMemberStateByThreadIdFamilySelector,
    { threadIds, channelId },
  );

  return { inboxThreadMemberStateByThreadId, channelId };
};
