import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconEdit } from 'twenty-ui/icon';

import { aiChatNewThreadChannelIdState } from '@/ai-chat/composer/states/aiChatNewThreadChannelIdState';
import { shouldFocusChatEditorFamilyState } from '@/ai-chat/states/shouldFocusChatEditorFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useStore } from 'jotai';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/pages/ask-ai/states/askAiSidePanelThreadIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isInboxPath } from '~/utils/isInboxPath';

export const SidePanelAskAiNewChatButton = () => {
  const { t } = useLingui();
  const setAskAiSidePanelThreadId = useSetAtomComponentState(
    askAiSidePanelThreadIdComponentState,
  );
  const store = useStore();
  const setAiChatNewThreadChannelId = useSetAtomState(
    aiChatNewThreadChannelIdState,
  );

  const handleClick = () => {
    if (!isInboxPath(window.location.pathname)) {
      setAiChatNewThreadChannelId(null);
    }

    setAskAiSidePanelThreadId(null);
    store.set(
      shouldFocusChatEditorFamilyState.atomFamily({
        threadId: store.get(newAiChatThreadIdState.atom),
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
