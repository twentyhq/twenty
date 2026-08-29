import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { Button, LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { getAiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/getAiChatSuggestedPrompts';
import { useAiChatSuggestedPromptsContext } from '@/ai/hooks/useAiChatSuggestedPromptsContext';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';
import { dispatchAgentChatSendMessageEvent } from '@/ai/utils/dispatchAgentChatSendMessageEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div<{ isCentered: boolean }>`
  align-items: ${({ isCentered }) => (isCentered ? 'center' : 'stretch')};
  display: flex;
  flex-direction: column;
  gap: ${({ isCentered }) =>
    isCentered ? themeCssVariables.spacing[4] : themeCssVariables.spacing[2]};
  padding: ${({ isCentered }) =>
    isCentered ? themeCssVariables.spacing[4] : themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div<{ isCentered: boolean }>`
  align-content: center;
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  font-size: ${({ isCentered }) =>
    isCentered
      ? themeCssVariables.font.size.xl
      : themeCssVariables.font.size.sm};
  font-weight: ${({ isCentered }) =>
    isCentered
      ? themeCssVariables.font.weight.semiBold
      : themeCssVariables.font.weight.medium};
  height: ${({ isCentered }) => (isCentered ? 'auto' : '24px')};
  padding: 0 ${themeCssVariables.spacing[2]};
  text-align: ${({ isCentered }) => (isCentered ? 'center' : 'left')};
`;

const StyledPromptList = styled.div<{ isCentered: boolean }>`
  align-items: ${({ isCentered }) => (isCentered ? 'center' : 'flex-start')};
  display: flex;
  flex-direction: ${({ isCentered }) => (isCentered ? 'row' : 'column')};
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

const pickRandom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

type AiChatSuggestedPromptsProps = {
  editor: Editor | null;
  isCentered?: boolean;
};

export const AiChatSuggestedPrompts = ({
  editor,
  isCentered = false,
}: AiChatSuggestedPromptsProps) => {
  const { t: resolveMessage } = useLingui();
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatSuggestedPromptsContext = useAiChatSuggestedPromptsContext();

  const suggestedPrompts = getAiChatSuggestedPrompts(
    aiChatSuggestedPromptsContext,
  );

  const handleClick = (suggestedPrompt: SuggestedPrompt) => {
    const text = resolveMessage(pickRandom(suggestedPrompt.prompts));

    if (suggestedPrompt.mode === 'SEND') {
      // Sending reads the draft rather than the editor, so it has to be written
      // before the event is dispatched.
      setAgentChatDraftsByThreadId((previousDrafts) => ({
        ...previousDrafts,
        [currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY]:
          serializePlainTextAsAdvancedTextEditorDocument(text),
      }));
      dispatchAgentChatSendMessageEvent();
      editor?.commands.clearContent();

      return;
    }

    setAgentChatInput(text);
    editor?.commands.setContent({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    });
    editor?.commands.focus('end');
  };

  return (
    <StyledContainer isCentered={isCentered}>
      <StyledTitle isCentered={isCentered}>
        {t`What can I help you with?`}
      </StyledTitle>
      <StyledPromptList isCentered={isCentered}>
        {suggestedPrompts.map((suggestedPrompt) =>
          isCentered ? (
            <Button
              key={suggestedPrompt.id}
              Icon={suggestedPrompt.Icon}
              title={resolveMessage(suggestedPrompt.label)}
              variant="secondary"
              onClick={() => handleClick(suggestedPrompt)}
            />
          ) : (
            <LightButton
              key={suggestedPrompt.id}
              Icon={suggestedPrompt.Icon}
              title={resolveMessage(suggestedPrompt.label)}
              accent="secondary"
              onClick={() => handleClick(suggestedPrompt)}
            />
          ),
        )}
      </StyledPromptList>
    </StyledContainer>
  );
};
