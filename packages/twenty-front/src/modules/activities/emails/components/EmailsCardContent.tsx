import { ActivityList } from '@/activities/components/ActivityList';
import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { EmailThreadPreview } from '@/activities/emails/components/EmailThreadPreview';
import { EmptyInboxPlaceholder } from '@/activities/emails/components/EmptyInboxPlaceholder';
import { StyledWidgetContentContainer } from '@/ui/layout/components/WidgetContentContainer';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconFilterOff } from 'twenty-ui/icon';
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
  isFiltered?: boolean;
  onClearFilter?: () => void;
  firstQueryLoading: boolean;
  isFetchingMore: boolean;
  onLastRowVisible: () => Promise<void>;
  timelineThreads: TimelineThread[] | undefined;
};

export const EmailsCardContent = ({
  isFiltered = false,
  onClearFilter,
  firstQueryLoading,
  isFetchingMore,
  onLastRowVisible,
  timelineThreads,
}: EmailsCardContentProps) => {
  const { t } = useLingui();

  if (firstQueryLoading) {
    return <SkeletonLoader />;
  }

  if (isFiltered && !timelineThreads?.length) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Title>{t`No matching conversations`}</EmptyState.Title>
          <EmptyState.Description>
            {t`No conversation uses this channel.`}
          </EmptyState.Description>
        </EmptyState.Content>
        <EmptyState.Actions>
          <Button
            startIcon={<IconFilterOff />}
            onClick={onClearFilter}
            variant="outline"
          >{t`Clear filter`}</Button>
        </EmptyState.Actions>
      </EmptyState.Root>
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
