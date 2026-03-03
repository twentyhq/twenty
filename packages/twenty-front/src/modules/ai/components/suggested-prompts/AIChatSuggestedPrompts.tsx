import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { LightButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  DEFAULT_SUGGESTED_PROMPTS,
  type SuggestedPrompt,
} from '@/ai/components/suggested-prompts/default-suggested-prompts';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  align-content: center;
  color: ${themeCssVariables.font.color.primary};
  display: grid;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 24px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledSuggestedPromptButton = styled(LightButton)`
  align-self: flex-start;
`;

const pickRandom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

type AIChatSuggestedPromptsProps = {
  editor: Editor | null;
};

export const AIChatSuggestedPrompts = ({
  editor,
}: AIChatSuggestedPromptsProps) => {
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
    <StyledContainer>
      <StyledTitle>{t`What can I help you with?`}</StyledTitle>
      {DEFAULT_SUGGESTED_PROMPTS.map((prompt) => (
        <StyledSuggestedPromptButton
          key={prompt.id}
          Icon={prompt.Icon}
          title={resolveMessage(prompt.label)}
          accent="secondary"
          onClick={() => handleClick(prompt)}
        />
      ))}
    </StyledContainer>
  );
};
