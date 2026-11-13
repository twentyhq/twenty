import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useLoadInboxThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { type InboxThreadListSource } from '@/ai/types/AgentChatThreadListSource';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

type InboxThreadListLoadEffectProps = {
  source: InboxThreadListSource;
};

export const InboxThreadListLoadEffect = ({
  source,
}: InboxThreadListLoadEffectProps) => {
  const isRecentThreadListLoaded = isDefined(
    useAtomFamilyStateValue(
      inboxThreadListFamilyState,
      getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
    ),
  );
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const sourceKey = getInboxThreadListSourceKey(source);

  useEffect(() => {
    if (isRecentThreadListLoaded) {
      void loadInboxThreadList({ source, mode: 'refresh' });
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecentThreadListLoaded, loadInboxThreadList, sourceKey]);

  return null;
};
