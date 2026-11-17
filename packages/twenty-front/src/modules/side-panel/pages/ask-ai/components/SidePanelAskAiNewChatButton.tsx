import { useLingui } from '@lingui/react/macro';
import { IconButton } from 'twenty-ui/components/input';
import { IconEdit } from 'twenty-ui/icon';

import { aiChatNewThreadChannelIdState } from '@/ai/states/aiChatNewThreadChannelIdState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { askAiSidePanelThreadIdComponentState } from '@/side-panel/pages/ask-ai/states/askAiSidePanelThreadIdComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isInboxPath } from '~/utils/isInboxPath';

export const SidePanelAskAiNewChatButton = () => {
  const { t } = useLingui();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const setAskAiSidePanelThreadId = useSetAtomComponentState(
    askAiSidePanelThreadIdComponentState,
  );
  const setShouldFocusChatEditor = useSetAtomState(shouldFocusChatEditorState);
  const setAiChatNewThreadChannelId = useSetAtomState(
    aiChatNewThreadChannelIdState,
  );

  const handleClick = () => {
    if (!isInboxPath(window.location.pathname)) {
      setAiChatNewThreadChannelId(null);
    }

    setAskAiSidePanelThreadId(newAiChatThreadId);
    setShouldFocusChatEditor(true);
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
