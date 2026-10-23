import { LinkCalendarEventsDropdown } from '@/activities/calendar/components/LinkCalendarEventsDropdown';
import { useComposeCalendarEventRelatedRecordAction } from '@/activities/calendar/hooks/useComposeCalendarEventRelatedRecordAction';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useLingui } from '@lingui/react/macro';
import { IconCalendarEvent, IconLink } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type CalendarEventsEmptyStateProps = {
  objectName: string;
};

export const CalendarEventsEmptyState = ({
  objectName,
}: CalendarEventsEmptyStateProps) => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
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
      <EmptyState.Actions>
        <LinkCalendarEventsDropdown
          dropdownIdPrefix="calendar-empty-state-link-events"
          trigger={
            <Button startIcon={<IconLink />} variant="outline">
              {t`Link events`}
            </Button>
          }
        />
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
      </EmptyState.Actions>
    </EmptyState.Root>
  );
};
