import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { Button, LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  DEFAULT_SUGGESTED_PROMPTS,
  type SuggestedPrompt,
} from '@/ai/components/suggested-prompts/default-suggested-prompts';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
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

  const handleClick = (prompt: SuggestedPrompt) => {
    const picked = pickRandom(prompt.prefillPrompts);
    const text = resolveMessage(picked);

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
        {DEFAULT_SUGGESTED_PROMPTS.map((prompt) =>
          isCentered ? (
            <Button
              key={prompt.id}
              Icon={prompt.Icon}
              title={resolveMessage(prompt.label)}
              variant="secondary"
              onClick={() => handleClick(prompt)}
            />
          ) : (
            <LightButton
              key={prompt.id}
              Icon={prompt.Icon}
              title={resolveMessage(prompt.label)}
              accent="secondary"
              onClick={() => handleClick(prompt)}
            />
          ),
        )}
      </StyledPromptList>
    </StyledContainer>
  );
};
