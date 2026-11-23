import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { TAB_PRESENCE_HEARTBEAT_INTERVAL_MS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { onlineWorkspaceMemberIdsState } from '@/tab-presence/states/onlineWorkspaceMemberIdsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { GetOnlineWorkspaceMemberIdsDocument } from '~/generated-metadata/graphql';

export const OnlineWorkspaceMemberIdsEffect = () => {
  const setOnlineWorkspaceMemberIds = useSetAtomState(
    onlineWorkspaceMemberIdsState,
  );
  const { data, error, refetch } = useQuery(
    GetOnlineWorkspaceMemberIdsDocument,
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: false,
      pollInterval: TAB_PRESENCE_HEARTBEAT_INTERVAL_MS,
      skipPollAttempt: () => document.hidden,
    },
  );

  useEffect(() => {
    if (isDefined(error)) {
      setOnlineWorkspaceMemberIds(null);

      return;
    }

    if (isDefined(data)) {
      setOnlineWorkspaceMemberIds(data.onlineWorkspaceMemberIds);
    }
  }, [data, error, setOnlineWorkspaceMemberIds]);

  useEffect(
    () => () => setOnlineWorkspaceMemberIds(null),
    [setOnlineWorkspaceMemberIds],
  );

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
