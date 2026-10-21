import { getTimelineCalendarEventLabel } from '@/activities/calendar/utils/getTimelineCalendarEventLabel';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { type TimelineCalendarEvent } from '~/generated/graphql';
import { formatToHumanReadableDate } from '~/utils/date-utils';

type LinkCalendarEventOptionItemProps = {
  calendarEvent: Pick<
    TimelineCalendarEvent,
    'id' | 'title' | 'visibility' | 'startsAt'
  >;
  isLinked: boolean;
  disabled: boolean;
  onToggle: (calendarEventId: string) => void;
};

export const LinkCalendarEventOptionItem = ({
  calendarEvent,
  isLinked,
  disabled,
  onToggle,
}: LinkCalendarEventOptionItemProps) => (
  <Dropdown.OptionItem
    value={calendarEvent.id}
    selected={isLinked}
    indicator="checkbox"
    disabled={disabled}
    startIcon={<IconCalendarEvent />}
    description={formatToHumanReadableDate(calendarEvent.startsAt)}
    onSelect={() => onToggle(calendarEvent.id)}
  >
    {getTimelineCalendarEventLabel(calendarEvent)}
  </Dropdown.OptionItem>
);
