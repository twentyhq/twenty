import { useEffect } from 'react';

import { aiChatNewThreadChannelIdState } from '@/ai/states/aiChatNewThreadChannelIdState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const InboxNewThreadChannelEffect = () => {
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const setAiChatNewThreadChannelId = useSetAtomState(
    aiChatNewThreadChannelIdState,
  );
  const shownChannelId = inboxSelectedChannelView?.channelId ?? null;

  useEffect(() => {
    setAiChatNewThreadChannelId(shownChannelId);
  }, [setAiChatNewThreadChannelId, shownChannelId]);

  return null;
};
