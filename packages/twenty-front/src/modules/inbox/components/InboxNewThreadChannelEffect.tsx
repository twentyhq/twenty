import { useEffect } from 'react';

import { aiChatNewThreadRecipientsFamilyState } from '@/ai-chat/states/aiChatNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const InboxNewThreadChannelEffect = () => {
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const setAiChatNewThreadRecipients = useSetAtomFamilyState(
    aiChatNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const shownChannelId = inboxSelectedChannelView?.channelId ?? null;

  useEffect(() => {
    setAiChatNewThreadRecipients((recipients) => ({
      ...recipients,
      channelId: shownChannelId,
    }));
  }, [setAiChatNewThreadRecipients, shownChannelId]);

  return null;
};
