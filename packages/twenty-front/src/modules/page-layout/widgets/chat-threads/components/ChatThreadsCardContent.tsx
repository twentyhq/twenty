import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  AnimatedPlaceholderErrorContainer,
  AnimatedPlaceholderErrorSubTitle,
  AnimatedPlaceholderErrorTextContainer,
  AnimatedPlaceholderErrorTitle,
} from 'twenty-ui/primitives/feedback';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
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
  hasError: boolean;
  onRetry: () => void;
  threads: GetChatThreadsForRecordQuery['chatThreadsForRecord'];
};

export const ChatThreadsCardContent = ({
  loading,
  hasError,
  onRetry,
  threads,
}: ChatThreadsCardContentProps) => {
  const isThreadsEmpty = threads.length === 0;

  if (loading && isThreadsEmpty) {
    return <SkeletonLoader />;
  }

  // A failed query used to fall through to the empty state, which told the
  // reader this record has no conversations when we simply could not tell.
  if (hasError && isThreadsEmpty) {
    return (
      <AnimatedPlaceholderErrorContainer>
        <AnimatedPlaceholder type="errorIndex" />
        <AnimatedPlaceholderErrorTextContainer>
          <AnimatedPlaceholderErrorTitle>
            {t`We couldn't load the conversations`}
          </AnimatedPlaceholderErrorTitle>
          <AnimatedPlaceholderErrorSubTitle>
            {t`Something went wrong while fetching this record's conversations.`}
          </AnimatedPlaceholderErrorSubTitle>
        </AnimatedPlaceholderErrorTextContainer>
        <Button
          startIcon={<IconRefresh />}
          onClick={onRetry}
          variant="outline"
        >{t`Try again`}</Button>
      </AnimatedPlaceholderErrorContainer>
    );
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
            {t`Conversations linked to this record will appear here.`}
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
