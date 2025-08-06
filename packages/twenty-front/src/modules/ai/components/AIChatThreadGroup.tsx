import { currentAIChatThreadComponentState } from '@/ai/states/currentAIChatThreadComponentState';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSparkles } from 'twenty-ui/display';
import { AgentChatThread } from '~/generated-metadata/graphql';

const StyledThreadsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledDateGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledDateHeader = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledThreadItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: all 0.2s ease;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  border-left: 3px solid transparent;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1, 0.25)};
  right: ${({ theme }) => theme.spacing(0.75)};
  position: relative;
  width: calc(100% + ${({ theme }) => theme.spacing(0.25)});

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledSparkleIcon = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.blue};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
`;

const StyledThreadContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledThreadTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AIChatThreadGroup = ({
  threads,
  title,
  agentId,
}: {
  threads: AgentChatThread[];
  agentId: string;
  title: string;
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [, setCurrentThreadId] = useRecoilComponentState(
    currentAIChatThreadComponentState,
    agentId,
  );
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  if (threads.length === 0) {
    return null;
  }

  return (
    <StyledDateGroup>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadsList>
        {threads.map((thread) => (
          <StyledThreadItem
            onClick={() => {
              setCurrentThreadId(thread.id);
              openAskAIPage(thread.title);
            }}
            key={thread.id}
          >
            <StyledSparkleIcon>
              <IconSparkles
                size={theme.icon.size.md}
                color={theme.color.blue}
              />
            </StyledSparkleIcon>
            <StyledThreadContent>
              <StyledThreadTitle>
                {thread.title || t`Untitled`}
              </StyledThreadTitle>
            </StyledThreadContent>
          </StyledThreadItem>
        ))}
      </StyledThreadsList>
    </StyledDateGroup>
  );
};
