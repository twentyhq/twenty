import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useAddInboxThread } from '@/inbox/hooks/useAddInboxThread';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type InboxRecentThreadListSyncEffectProps = {
  threadId: string;
};

export const InboxRecentThreadListSyncEffect = ({
  threadId,
}: InboxRecentThreadListSyncEffectProps) => {
  const aiChatThreadRecord = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );
  const aiChatError = useAtomFamilyStateValue(aiChatErrorFamilyState, {
    threadId,
  });
  const { prependInboxThreadToRecentList } = useAddInboxThread();
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const isThreadFetched = isDefined(aiChatThreadRecord?.conversationType);
  const isThreadNotFound = isGraphqlErrorOfType(aiChatError, 'NOT_FOUND');

  useEffect(() => {
    if (isThreadFetched) {
      prependInboxThreadToRecentList(threadId);
    }
  }, [isThreadFetched, threadId, prependInboxThreadToRecentList]);

  useEffect(() => {
    if (isThreadNotFound) {
      void loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      });
    }
  }, [isThreadNotFound, loadInboxThreadList]);

  return null;
};
