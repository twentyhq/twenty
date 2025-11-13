import styled from '@emotion/styled';

import { AIChatThreadGroup } from '@/ai/components/AIChatThreadGroup';
import { AIChatThreadsListEffect } from '@/ai/components/AIChatThreadsListEffect';
import { AIChatSkeletonLoader } from '@/ai/components/internal/AIChatSkeletonLoader';
import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { groupThreadsByDate } from '@/ai/utils/groupThreadsByDate';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { Key } from 'ts-key-enum';
import { capitalize } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';
import { useGetChatThreadsQuery } from '~/generated-metadata/graphql';

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

export const AIChatThreadsList = () => {
  const { createChatThread } = useCreateNewAIChatThread();

  const focusId = 'threads-list';

  useHotkeysOnFocusedElement({
    keys: [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    callback: () => createChatThread(),
    focusId,
    dependencies: [createChatThread],
  });

  const { data: { chatThreads = [] } = {}, loading } = useGetChatThreadsQuery();

  const groupedThreads = groupThreadsByDate(chatThreads);

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
              threads={threads}
            />
          ))}
        </StyledThreadsContainer>
        <StyledButtonsContainer>
          <Button
            variant="primary"
            accent="blue"
            size="medium"
            title={t`New chat`}
            onClick={() => createChatThread()}
            hotkeys={[getOsControlSymbol(), '⏎']}
          />
        </StyledButtonsContainer>
      </StyledContainer>
    </>
  );
};
