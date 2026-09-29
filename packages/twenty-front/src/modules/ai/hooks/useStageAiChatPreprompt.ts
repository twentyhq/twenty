import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import {
  type AgentChatPrepromptMode,
  agentChatPrepromptState,
} from '@/ai/states/agentChatPrepromptState';
import { type AgentChatDraft } from '@/ai/types/AgentChatDraft';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// Staging a preprompt is always these two steps: sending reads the draft rather
// than the editor, so the draft has to be written before AgentChatPrepromptEffect
// picks the preprompt up.
export const useStageAiChatPreprompt = () => {
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const setAgentChatPreprompt = useSetAtomState(agentChatPrepromptState);

  const stageAiChatPrepromptDraft = ({
    draft,
    mode,
    draftKey,
  }: {
    draft: AgentChatDraft;
    mode: AgentChatPrepromptMode;
    draftKey: string;
  }) => {
    setAgentChatDraftsByThreadId((previousDrafts) => ({
      ...previousDrafts,
      [draftKey]: draft,
    }));
    setAgentChatPreprompt({ draftKey, mode });
  };

  const stageAiChatPreprompt = ({
    text,
    mode,
    draftKey,
  }: {
    text: string;
    mode: AgentChatPrepromptMode;
    draftKey: string;
  }) =>
    stageAiChatPrepromptDraft({
      draft: {
        serializedDocument:
          serializePlainTextAsAdvancedTextEditorDocument(text),
      },
      mode,
      draftKey,
    });

  return { stageAiChatPreprompt, stageAiChatPrepromptDraft };
};
