import { useEffect } from 'react';

import { inboxNewThreadChannelIdState } from '@/inbox/states/inboxNewThreadChannelIdState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const InboxNewThreadChannelEffect = () => {
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const setInboxNewThreadChannelId = useSetAtomState(
    inboxNewThreadChannelIdState,
  );
  const shownChannelId = inboxSelectedChannelView?.channelId ?? null;

  useEffect(() => {
    setInboxNewThreadChannelId(shownChannelId);
  }, [setInboxNewThreadChannelId, shownChannelId]);

  return null;
};
