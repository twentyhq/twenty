import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { LightButton } from 'twenty-ui/input';

import {
  DEFAULT_SUGGESTED_PROMPTS,
  type SuggestedPrompt,
} from '@/ai/components/suggested-prompts/default-suggested-prompts';
import { agentChatInputStateV2 } from '@/ai/states/agentChatInputStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  align-content: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: grid;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 24px;
  padding: ${({ theme }) => `0 ${theme.spacing(2)}`};
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
  const setAgentChatInput = useSetRecoilStateV2(agentChatInputStateV2);

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
