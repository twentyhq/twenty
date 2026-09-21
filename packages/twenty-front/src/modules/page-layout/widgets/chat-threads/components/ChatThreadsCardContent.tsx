import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { type GetChatThreadsForRecordQuery } from '~/generated-metadata/graphql';

const StyledThreadsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
`;

type ChatThreadsCardContentProps = {
  loading: boolean;
  threads: GetChatThreadsForRecordQuery['chatThreadsForRecord'];
};

export const ChatThreadsCardContent = ({
  loading,
  threads,
}: ChatThreadsCardContentProps) => {
  const isThreadsEmpty = threads.length === 0;

  if (loading && isThreadsEmpty) {
    return <SkeletonLoader />;
  }

  if (isThreadsEmpty) {
    return (
      <AnimatedPlaceholderEmptyContainer>
        <AnimatedPlaceholder type="emptyInbox" />
        <AnimatedPlaceholderEmptyTextContainer>
          <AnimatedPlaceholderEmptyTitle>
            {t`No conversations`}
          </AnimatedPlaceholderEmptyTitle>
          <AnimatedPlaceholderEmptySubTitle>
            {t`Attach a conversation from the chat to see it here.`}
          </AnimatedPlaceholderEmptySubTitle>
        </AnimatedPlaceholderEmptyTextContainer>
      </AnimatedPlaceholderEmptyContainer>
    );
  }

  return (
    <StyledThreadsContainer>
      {threads.map((thread) => (
        <AiChatThreadListItem key={thread.id} thread={thread} />
      ))}
    </StyledThreadsContainer>
  );
};
