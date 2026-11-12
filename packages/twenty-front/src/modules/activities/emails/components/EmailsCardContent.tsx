import { ActivityList } from '@/activities/components/ActivityList';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { EmptyInboxPlaceholder } from '@/activities/emails/components/EmptyInboxPlaceholder';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { ErrorState } from '@/ui/feedback/empty-state/components/ErrorState';
import { StyledWidgetContentContainer } from '@/ui/layout/components/WidgetContentContainer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type TimelineThread } from '~/generated/graphql';

const StyledContainer = styled(StyledWidgetContentContainer)`
  gap: ${themeCssVariables.spacing[6]};
  overflow: hidden;
`;

const StyledSection = styled(Section.Root)`
  display: flex;
  flex: 1;
  min-height: 0;
`;

type EmailsCardContentProps = {
  error?: unknown;
  onRetry: () => void;
  firstQueryLoading: boolean;
  isFetchingMore: boolean;
  onLastRowVisible: () => Promise<void>;
  timelineThreads: TimelineThread[] | undefined;
};

export const EmailsCardContent = ({
  error,
  onRetry,
  firstQueryLoading,
  isFetchingMore,
  onLastRowVisible,
  timelineThreads,
}: EmailsCardContentProps) => {
  const { t } = useLingui();

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (isDefined(error) && !timelineThreads?.length) {
    return (
      <ErrorState.Root>
        <AnimatedPlaceholder type="errorIndex" />
        <ErrorState.Content>
          <ErrorState.Title>{t`We couldn't load the messages`}</ErrorState.Title>
          <ErrorState.Description>
            {t`Something went wrong while fetching this record's messages.`}
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

  if (!timelineThreads?.length) {
    return (
      <StyledContainer>
        <EmptyInboxPlaceholder />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledSection>
        <ActivityList isScrollable>
          {timelineThreads.map((thread) => (
            <EmailThreadPreview key={thread.id} thread={thread} divider />
          ))}
          <CustomResolverFetchMoreLoader
            loading={isFetchingMore}
            onLastRowVisible={onLastRowVisible}
          />
        </ActivityList>
      </StyledSection>
    </StyledContainer>
  );
};
