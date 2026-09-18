import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { useStore } from 'jotai';

import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import { GetUnreadChatThreadIdsDocument } from '~/generated-metadata/graphql';

type AiChatUnreadThreadsEffectProps = {
  threadIds: string[];
};

// One query for the whole list rather than a cursor per row. The ids are
// joined into a key so the query re-runs when the list changes but not when it
// is merely re-rendered in the same order.
export const AiChatUnreadThreadsEffect = ({
  threadIds,
}: AiChatUnreadThreadsEffectProps) => {
  const store = useStore();
  const threadIdsKey = threadIds.join(',');

  const { data } = useQuery(GetUnreadChatThreadIdsDocument, {
    variables: { threadIds },
    skip: threadIds.length === 0,
    fetchPolicy: 'cache-and-network',
  });

  const unreadThreadIdsKey = (data?.unreadChatThreadIds ?? []).join(',');

  useEffect(() => {
    store.set(
      agentChatUnreadThreadIdsState.atom,
      unreadThreadIdsKey === '' ? [] : unreadThreadIdsKey.split(','),
    );
  }, [store, unreadThreadIdsKey, threadIdsKey]);

  return null;
};
