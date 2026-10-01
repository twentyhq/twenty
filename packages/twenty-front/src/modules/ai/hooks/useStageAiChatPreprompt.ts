import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Sending reads the draft, not the editor, so it's written before AgentChatPrepromptEffect picks it up.
export const useStageAiChatPreprompt = () => {
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const setAgentChatPreprompt = useSetAtomState(agentChatPrepromptState);

  const stageAiChatPreprompt = ({
    serializedDocument,
    mode,
    draftKey,
  }: {
    serializedDocument: string;
    mode: AgentChatPrepromptMode;
    draftKey: string;
  }) => {
    setAgentChatDraftsByThreadId((previousDrafts) => ({
      ...previousDrafts,
      [draftKey]: serializedDocument,
    }));
    setAgentChatPreprompt({ serializedDocument, mode });
  };

  return { stageAiChatPreprompt };
};
