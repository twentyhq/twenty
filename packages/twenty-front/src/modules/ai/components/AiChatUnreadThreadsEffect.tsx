import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { useStore } from 'jotai';

import { useChatThreads } from '@/ai/hooks/useChatThreads';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import {
  GetUnreadChatThreadIdsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

// Every thread the reader can see, not the ones one page happens to list: the
// drawer counts unread threads across channels it is not showing, and a
// narrower list would silently unread-mark whatever it left out.
export const AiChatUnreadThreadsEffect = () => {
  const store = useStore();
  const { threads } = useChatThreads();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const threadIds = threads.map((thread) => thread.id);
  const threadIdsKey = threadIds.join(',');

  const { data } = useQuery(GetUnreadChatThreadIdsDocument, {
    variables: { threadIds },
    skip: threadIds.length === 0 || !hasAiPermission,
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
