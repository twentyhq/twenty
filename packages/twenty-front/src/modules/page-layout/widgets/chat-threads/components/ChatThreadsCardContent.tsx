import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatThreadListItem } from '@/ai/components/AiChatThreadListItem';
import { AI_CHAT_THREAD_ACTIONS_SURFACE } from '@/ai/constants/AiChatThreadActionsSurface';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { PageLayoutWidgetErrorDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetErrorDisplay';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';
import { type GetChatThreadsForRecordQuery } from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

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
  error?: unknown;
  widgetId: string;
  onRetry: () => void;
  threads: GetChatThreadsForRecordQuery['chatThreadsForRecord'];
};

export const ChatThreadsCardContent = ({
  loading,
  error,
  widgetId,
  onRetry,
  threads,
}: ChatThreadsCardContentProps) => {
  const isThreadsEmpty = threads.length === 0;

  if (loading && isThreadsEmpty) {
    return <SkeletonLoader />;
  }

  // A denial is not transient: the resolver is behind the AI permission flag,
  // so offering a retry here would loop forever on a role that cannot read
  // conversations at all.
  if (isGraphqlErrorOfType(error, 'FORBIDDEN')) {
    return <PageLayoutWidgetErrorDisplay widgetId={widgetId} error={error} />;
  }

  if (isDefined(error) && isThreadsEmpty) {
    return (
      <ErrorState.Root>
        <AnimatedPlaceholder type="errorIndex" />
        <ErrorState.Content>
          <ErrorState.Title>
            {t`We couldn't load the conversations`}
          </ErrorState.Title>
          <ErrorState.Description>
            {t`Something went wrong while fetching this record's conversations.`}
          </ErrorState.Description>
        </ErrorState.Content>
        <Button
          startIcon={<IconRefresh />}
          onClick={onRetry}
          variant="outline"
        >{t`Try again`}</Button>
      </ErrorState.Root>
    );
  }

  if (isThreadsEmpty) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type="emptyInbox" />
        <EmptyState.Content>
          <EmptyState.Title>{t`No conversations`}</EmptyState.Title>
          <EmptyState.Description>
            {t`Conversations linked to this record will appear here.`}
          </EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <StyledThreadsContainer>
      {threads.map((thread) => (
        <AiChatThreadListItem
          key={thread.id}
          thread={thread}
          surface={AI_CHAT_THREAD_ACTIONS_SURFACE.RECORD_PAGE}
        />
      ))}
    </StyledThreadsContainer>
  );
};
