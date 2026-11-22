import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconEdit } from 'twenty-ui/icon';

import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { aiChatComposerShouldFocusFamilyState } from '@/ai-chat/states/composer/aiChatComposerShouldFocusFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useStore } from 'jotai';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/states/askAiSidePanelThreadIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const SidePanelAskAiNewChatButton = () => {
  const { t } = useLingui();
  const setAskAiSidePanelThreadId = useSetAtomComponentState(
    askAiSidePanelThreadIdComponentState,
  );
  const store = useStore();
  const handleClick = () => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);

    store.set(
      aiChatComposerNewThreadRecipientsFamilyState.atomFamily(
        newAiChatThreadId,
      ),
      (recipients) => ({ ...recipients, channelId: null }),
    );

    setAskAiSidePanelThreadId(null);
    store.set(
      aiChatComposerShouldFocusFamilyState.atomFamily({
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
