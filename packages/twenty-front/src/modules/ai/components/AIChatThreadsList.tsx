import styled from '@emotion/styled';

import { AIChatThreadGroup } from '@/ai/components/AIChatThreadGroup';
import { AIChatThreadsListEffect } from '@/ai/components/AIChatThreadsListEffect';
import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { Key } from 'ts-key-enum';
import { capitalize } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { useGetAgentChatThreadsQuery } from '~/generated-metadata/graphql';

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

const StyledButtonsContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(2, 2.5)};
  justify-content: flex-end;
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
`;

export const AIChatThreadsList = ({ agentId }: { agentId: string }) => {
  const { createAgentChatThread } = useCreateNewAIChatThread({ agentId });

  const focusId = `${agentId}-threads-list`;

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => createAgentChatThread(),
    focusId,
    dependencies: [createAgentChatThread, agentId],
  });

  const { data: { agentChatThreads = [] } = {}, loading } =
    useGetAgentChatThreadsQuery({
      variables: { agentId },
    });

  const groupedThreads = groupThreadsByDate(agentChatThreads);

  if (loading === true) {
    return <AIChatSkeletonLoader />;
  }

  return (
    <>
      <AIChatThreadsListEffect focusId={focusId} />
      <StyledContainer>
        <StyledThreadsContainer>
          {Object.entries(groupedThreads).map(([title, threads]) => (
            <AIChatThreadGroup
              key={title}
              title={capitalize(title)}
              agentId={agentId}
              threads={threads}
            />
          ))}
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
    </>
  );
};
