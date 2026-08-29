import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Button, LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { getAiChatSuggestedPrompts } from '@/ai/components/suggested-prompts/getAiChatSuggestedPrompts';
import { useAiChatSuggestedPromptsContext } from '@/ai/hooks/useAiChatSuggestedPromptsContext';
import { useStageAiChatPreprompt } from '@/ai/hooks/useStageAiChatPreprompt';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type SuggestedPrompt } from '@/ai/types/SuggestedPrompt';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  isCentered?: boolean;
};

export const AiChatSuggestedPrompts = ({
  isCentered = false,
}: AiChatSuggestedPromptsProps) => {
  const { t: resolveMessage } = useLingui();
  const { stageAiChatPreprompt } = useStageAiChatPreprompt();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const aiChatSuggestedPromptsContext = useAiChatSuggestedPromptsContext();

  const suggestedPrompts = getAiChatSuggestedPrompts(
    aiChatSuggestedPromptsContext,
  );

  const handleClick = (suggestedPrompt: SuggestedPrompt) => {
    stageAiChatPreprompt({
      text: resolveMessage(pickRandom(suggestedPrompt.prompts)),
      mode: suggestedPrompt.mode ?? 'PREFILL',
      draftKey: currentAiChatThread ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    });
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
