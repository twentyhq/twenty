import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';
import { LightButton } from 'twenty-ui/input';

import {
  DEFAULT_SUGGESTED_PROMPTS,
  type SuggestedPrompt,
} from '@/ai/components/suggested-prompts/default-suggested-prompts';
import { agentChatInputState } from '@/ai/states/agentChatInputState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `0 ${theme.spacing(2)}`};
`;

const StyledSuggestedPromptButton = styled(LightButton)`
  width: 100%;
`;

const pickRandom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export const AIChatSuggestedPrompts = () => {
  const { t: resolveMessage } = useLingui();
  const setAgentChatInput = useSetRecoilState(agentChatInputState);

  const handleClick = (prompt: SuggestedPrompt) => {
    const picked = pickRandom(prompt.prefillPrompts);

    setAgentChatInput(resolveMessage(picked));
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
