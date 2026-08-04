import { useReducedMotion } from 'framer-motion';
import { useStore } from 'jotai';
import { useState } from 'react';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';

export const useShouldShrinkSidePanelFromFullWidth = () => {
  const store = useStore();
  const shouldReduceMotion = useReducedMotion();

  const [isContinuingChatFromWorkspaceSetup] = useState(() =>
    store.get(shouldContinueAiChatInSidePanelState.atom),
  );

  return isContinuingChatFromWorkspaceSetup && !shouldReduceMotion;
};
