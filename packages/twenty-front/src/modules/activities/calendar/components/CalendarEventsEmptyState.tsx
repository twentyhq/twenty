import { LinkCalendarEventsDropdownContent } from '@/activities/calendar/components/LinkCalendarEventsDropdownContent';
import { useComposeCalendarEventRelatedRecordAction } from '@/activities/calendar/hooks/useComposeCalendarEventRelatedRecordAction';
import { LinkActivitiesDropdown } from '@/activities/components/LinkActivitiesDropdown';
import { useActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendarEvent, IconLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
`;

type CalendarEventsEmptyStateProps = {
  objectName: string;
};

export const CalendarEventsEmptyState = ({
  objectName,
}: CalendarEventsEmptyStateProps) => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const activityLinkConfig = useActivityLinkConfig({
    targetRecord,
    activityObjectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });
  const { action: createCalendarEventAction } =
    useComposeCalendarEventRelatedRecordAction(targetRecord);

  return (
    // TODO: change animated placeholder
    <EmptyState.Root>
      <AnimatedPlaceholder type="noMatchRecord" />
      <EmptyState.Content>
        <EmptyState.Title>{t`No Events`}</EmptyState.Title>
        <EmptyState.Description>
          {t`No events have been scheduled with this ${objectName} yet.`}
        </EmptyState.Description>
      </EmptyState.Content>
      <StyledButtons>
        {isDefined(activityLinkConfig) && (
          <LinkActivitiesDropdown
            dropdownId={`calendar-empty-state-link-events-${targetRecord.id}`}
            ariaLabel={t`Link events`}
            trigger={
              <Button startIcon={<IconLink />} variant="outline">
                {t`Link events`}
              </Button>
            }
          >
            <LinkCalendarEventsDropdownContent
              targetRecord={targetRecord}
              activityLinkConfig={activityLinkConfig}
            />
          </LinkActivitiesDropdown>
        )}
        {createCalendarEventAction.isVisible && (
          <Button
            startIcon={<IconCalendarEvent />}
            onClick={createCalendarEventAction.execute}
            disabled={createCalendarEventAction.disabled}
            variant="outline"
          >
            {createCalendarEventAction.label}
          </Button>
        )}
      </StyledButtons>
    </EmptyState.Root>
  );
};
