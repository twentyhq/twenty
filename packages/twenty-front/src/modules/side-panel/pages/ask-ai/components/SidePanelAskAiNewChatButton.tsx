import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconEdit } from 'twenty-ui/icon';

import { aiChatNewThreadRecipientsFamilyState } from '@/ai-chat/states/aiChatNewThreadRecipientsFamilyState';
import { aiChatShouldFocusEditorFamilyState } from '@/ai-chat/states/aiChatShouldFocusEditorFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useStore } from 'jotai';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/states/askAiSidePanelThreadIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isInboxPath } from '~/utils/isInboxPath';

export const SidePanelAskAiNewChatButton = () => {
  const { t } = useLingui();
  const setAskAiSidePanelThreadId = useSetAtomComponentState(
    askAiSidePanelThreadIdComponentState,
  );
  const store = useStore();
  const handleClick = () => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);

    if (!isInboxPath(window.location.pathname)) {
      store.set(
        aiChatNewThreadRecipientsFamilyState.atomFamily(newAiChatThreadId),
        (recipients) => ({ ...recipients, channelId: null }),
      );
    }

    setAskAiSidePanelThreadId(null);
    store.set(
      aiChatShouldFocusEditorFamilyState.atomFamily({
        threadId: newAiChatThreadId,
      }),
      true,
    );
  };

  return (
    <IconButton
      size="sm"
      variant="ghost"
      onClick={handleClick}
      aria-label={t`New conversation`}
    >
      <IconEdit />
    </IconButton>
  );
};
