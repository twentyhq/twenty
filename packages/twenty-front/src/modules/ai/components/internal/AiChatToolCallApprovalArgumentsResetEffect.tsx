import { useEffect } from 'react';

import { agentChatToolCallArgumentsFamilyState } from '@/ai/states/agentChatToolCallArgumentsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

// staged arguments live as long as the card, so a remounted card starts again from the proposal
export const AiChatToolCallApprovalArgumentsResetEffect = ({
  toolCallId,
}: {
  toolCallId: string;
}) => {
  const setAgentChatToolCallArguments = useSetAtomFamilyState(
    agentChatToolCallArgumentsFamilyState,
    toolCallId,
  );

  useEffect(
    () => () => setAgentChatToolCallArguments(undefined),
    [setAgentChatToolCallArguments],
  );

  return null;
};
