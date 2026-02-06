import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useSetRecoilState } from 'recoil';

import {
  DEFAULT_SUGGESTED_PROMPTS,
  type SuggestedPrompt,
} from '@/ai/components/suggested-prompts/default-suggested-prompts';
import { agentChatInputState } from '@/ai/states/agentChatInputState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)};
`;

const StyledTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledPromptButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledPromptLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
`;

const pickRandom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export const AIChatSuggestedPrompts = () => {
  const theme = useTheme();
  const { t: resolveMessage } = useLingui();
  const setAgentChatInput = useSetRecoilState(agentChatInputState);

  const handleClick = (prompt: SuggestedPrompt) => {
    const picked = pickRandom(prompt.prefillPrompts);

    setAgentChatInput(resolveMessage(picked));
  };

  return (
    <StyledContainer>
      <StyledTitle>{t`What can I help you with?`}</StyledTitle>
      {DEFAULT_SUGGESTED_PROMPTS.map((prompt) => {
        const Icon = prompt.Icon;

        return (
          <StyledPromptButton
            key={prompt.id}
            type="button"
            onClick={() => handleClick(prompt)}
          >
            <Icon
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={theme.font.color.tertiary}
            />
            <StyledPromptLabel>
              {resolveMessage(prompt.label)}
            </StyledPromptLabel>
          </StyledPromptButton>
        );
      })}
    </StyledContainer>
  );
};
