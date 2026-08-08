import { useEffect } from 'react';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// While the chat page is mounted, leaving it hands the conversation off to
// the side panel: SidePanelAskAiHandoffEffect consumes this marker on the
// navigation that exits the page. Exits that should not continue the chat
// (the close button) clear the marker before navigating.
export const AiChatPageContinueInSidePanelEffect = () => {
  const setShouldContinueAiChatInSidePanel = useSetAtomState(
    shouldContinueAiChatInSidePanelState,
  );

  useEffect(() => {
    setShouldContinueAiChatInSidePanel(true);

    return () => {
      setShouldContinueAiChatInSidePanel(false);
    };
  }, [setShouldContinueAiChatInSidePanel]);

  return null;
};
