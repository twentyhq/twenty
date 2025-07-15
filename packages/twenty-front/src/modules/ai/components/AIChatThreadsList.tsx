import styled from '@emotion/styled';
import { IconSparkles } from 'twenty-ui/display';

import { currentAIChatThreadComponentState } from '@/ai/components/states/currentAIChatThreadComponentState';
import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useAgentChatThreads } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/hooks/useAgentChatThreads';
import { useTheme } from '@emotion/react';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledThreadsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(3)};
`;

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
  cursor: pointer;
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

const StyledButtonsContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(1, 2)};
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
`;

export const AIChatThreadsList = ({ agentId }: { agentId: string }) => {
  const theme = useTheme();

  const [, setCurrentThreadId] = useRecoilComponentStateV2(
    currentAIChatThreadComponentState,
  );

  const { createAgentChatThread } = useCreateNewAIChatThread({ agentId });

  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const { data: { threads = [] } = {}, loading } = useAgentChatThreads(agentId);

  const groupThreadsByDate = (threads: any[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayThreads = threads.filter((thread) => {
      const threadDate = new Date(thread.createdAt);
      return threadDate.toDateString() === today.toDateString();
    });

    const yesterdayThreads = threads.filter((thread) => {
      const threadDate = new Date(thread.createdAt);
      return threadDate.toDateString() === yesterday.toDateString();
    });

    const olderThreads = threads.filter((thread) => {
      const threadDate = new Date(thread.createdAt);
      return (
        threadDate.toDateString() !== today.toDateString() &&
        threadDate.toDateString() !== yesterday.toDateString()
      );
    });

    return {
      today: todayThreads,
      yesterday: yesterdayThreads,
      older: olderThreads,
    };
  };

  const groupedThreads = groupThreadsByDate(threads);

  const renderThreadGroup = (title: string, threads: any[]) => {
    if (threads.length === 0) return null;

    return (
      <StyledDateGroup>
        <StyledDateHeader>{title}</StyledDateHeader>
        <StyledThreadsList>
          {threads.map((thread) => (
            <StyledThreadItem
              onClick={() => {
                setCurrentThreadId(thread.id);
                openAskAIPage();
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
                  {thread.title || 'New conversation'}
                </StyledThreadTitle>
              </StyledThreadContent>
            </StyledThreadItem>
          ))}
        </StyledThreadsList>
      </StyledDateGroup>
    );
  };

  if (loading) {
    return <StyledContainer>Loading...</StyledContainer>;
  }

  return (
    <StyledContainer>
      <StyledThreadsContainer>
        {renderThreadGroup('Today', groupedThreads.today)}
        {renderThreadGroup('Yesterday', groupedThreads.yesterday)}
        {renderThreadGroup('Older', groupedThreads.older)}
      </StyledThreadsContainer>
      <StyledButtonsContainer>
        <Button
          variant="primary"
          accent="blue"
          size="medium"
          title="New chat"
          onClick={() => createAgentChatThread()}
          hotkeys={[getOsControlSymbol(), '⏎']}
        />
      </StyledButtonsContainer>
    </StyledContainer>
  );
};
