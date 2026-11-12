import { useEffect } from 'react';

import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatSelectedChannelViewSelector } from '@/ai/states/selectors/agentChatSelectedChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AiChatInboxNewThreadChannelEffect = () => {
  const agentChatSelectedChannelView = useAtomStateValue(
    agentChatSelectedChannelViewSelector,
  );
  const setAgentChatNewThreadChannelId = useSetAtomState(
    agentChatNewThreadChannelIdState,
  );
  const shownChannelId = agentChatSelectedChannelView?.channelId ?? null;

  useEffect(() => {
    setAgentChatNewThreadChannelId(shownChannelId);
  }, [setAgentChatNewThreadChannelId, shownChannelId]);

  return null;
};
