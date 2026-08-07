import { useEffect } from 'react';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const ExpandedAiChatSidePanelHandoffEffect = () => {
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
