import { useQuery } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';

import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import {
  GetUnreadChatThreadIdsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type AiChatUnreadThreadsEffectProps = {
  threadIds: string[];
};

export const AiChatUnreadThreadsEffect = ({
  threadIds,
}: AiChatUnreadThreadsEffectProps) => {
  const store = useStore();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

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
  }, [store, unreadThreadIdsKey]);

  return null;
};
