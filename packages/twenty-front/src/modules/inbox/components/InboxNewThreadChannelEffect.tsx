import { useEffect } from 'react';

import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { inboxSelectedChannelViewSelector } from '@/inbox/states/selectors/inboxSelectedChannelViewSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const InboxNewThreadChannelEffect = () => {
  const inboxSelectedChannelView = useAtomStateValue(
    inboxSelectedChannelViewSelector,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const setAiChatComposerNewThreadRecipients = useSetAtomFamilyState(
    aiChatComposerNewThreadRecipientsFamilyState,
    newAiChatThreadId,
  );
  const shownChannelId = inboxSelectedChannelView?.channelId ?? null;

  useEffect(() => {
    setAiChatComposerNewThreadRecipients((recipients) => ({
      ...recipients,
      channelId: shownChannelId,
    }));
  }, [setAiChatComposerNewThreadRecipients, shownChannelId]);

  return null;
};
