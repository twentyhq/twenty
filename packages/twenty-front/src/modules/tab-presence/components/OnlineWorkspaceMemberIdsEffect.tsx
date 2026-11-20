import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { TAB_PRESENCE_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { aiChatOnlineWorkspaceMemberIdsState } from '@/ai-chat/threads/states/aiChatOnlineWorkspaceMemberIdsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { GetOnlineWorkspaceMemberIdsDocument } from '~/generated-metadata/graphql';

export const OnlineWorkspaceMemberIdsEffect = () => {
  const setAiChatOnlineWorkspaceMemberIds = useSetAtomState(
    aiChatOnlineWorkspaceMemberIdsState,
  );
  const { data, refetch } = useQuery(GetOnlineWorkspaceMemberIdsDocument, {
    fetchPolicy: 'network-only',
    pollInterval: TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
    skipPollAttempt: () => document.hidden,
  });

  useEffect(() => {
    if (isDefined(data)) {
      setAiChatOnlineWorkspaceMemberIds(data.onlineWorkspaceMemberIds);
    }
  }, [data, setAiChatOnlineWorkspaceMemberIds]);

  useEffect(() => {
    const refetchWhenVisible = () => {
      if (!document.hidden) {
        void refetch();
      }
    };

    document.addEventListener('visibilitychange', refetchWhenVisible);

    return () =>
      document.removeEventListener('visibilitychange', refetchWhenVisible);
  }, [refetch]);

  return null;
};
