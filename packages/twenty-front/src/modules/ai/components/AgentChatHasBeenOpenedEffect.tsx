import { useEffect } from 'react';
import { Temporal } from 'temporal-polyfill';

import { aiChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AiChatHasBeenOpenedEffect = () => {
  const setAiChatUISessionStartTime = useSetAtomState(
    aiChatUISessionStartTimeState,
  );

  useEffect(() => {
    setAiChatUISessionStartTime(
      (aiChatUISessionStartTime) =>
        aiChatUISessionStartTime ?? Temporal.Now.instant(),
    );
  }, [setAiChatUISessionStartTime]);

  return null;
};
