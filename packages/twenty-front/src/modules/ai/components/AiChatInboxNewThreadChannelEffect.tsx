import { useEffect } from 'react';

import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AiChatInboxNewThreadChannelEffect = () => {
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const setAgentChatNewThreadChannelId = useSetAtomState(
    agentChatNewThreadChannelIdState,
  );
  const shownChannelId = agentChatShownChannelView?.channelId ?? null;

  useEffect(() => {
    setAgentChatNewThreadChannelId(shownChannelId);
  }, [setAgentChatNewThreadChannelId, shownChannelId]);

  return null;
};
