import { useEffect } from 'react';

import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const InboxThreadPageContinueInSidePanelEffect = () => {
  const setShouldContinueInboxInSidePanel = useSetAtomState(
    shouldContinueInboxInSidePanelState,
  );

  useEffect(() => {
    setShouldContinueInboxInSidePanel(true);

    return () => {
      setShouldContinueInboxInSidePanel(false);
    };
  }, [setShouldContinueInboxInSidePanel]);

  return null;
};
