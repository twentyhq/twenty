import {
  ActionIcon,
  Button,
  Group,
  SegmentedControl,
  Text,
} from '@mantine/core';
import { type ToolbarProps } from 'react-big-calendar';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/display';
import { CALENDAR_VIEWS } from '@/propel/lib/socialCalendarConfig';
import {
  type SocialCalendarEvent,
  type SocialCalendarView,
} from '@/propel/types/socialCalendar';

// react-big-calendar injects the toolbar props (label/navigation/view) into our
// custom toolbar; alias the library generic to satisfy the named-props convention.
type CalendarToolbarProps = ToolbarProps<SocialCalendarEvent>;

// The calendar's own header row (§6): prev / today / next, the current label,
// and the Month / Week / List view switch. react-big-calendar drives navigation
// through this component's onNavigate / onView callbacks; we render Mantine
// controls so it matches the rest of the hero. View state is controlled by the
// page (passed back in via the `view` prop), so the SegmentedControl reflects it.
export const CalendarToolbar = (props: CalendarToolbarProps) => {
  const { label, onNavigate, onView, view } = props;

  return (
    <Group justify="space-between" wrap="nowrap" mb="sm" gap="sm">
      <Group gap={4} wrap="nowrap">
        <Button size="xs" variant="default" onClick={() => onNavigate('TODAY')}>
          Today
        </Button>
        <ActionIcon
          variant="default"
          size="md"
          aria-label="Previous"
          onClick={() => onNavigate('PREV')}
        >
          <IconChevronLeft size={16} />
        </ActionIcon>
        <ActionIcon
          variant="default"
          size="md"
          aria-label="Next"
          onClick={() => onNavigate('NEXT')}
        >
          <IconChevronRight size={16} />
        </ActionIcon>
        <Text fw={600} size="sm" ml={6} style={{ whiteSpace: 'nowrap' }}>
          {label}
        </Text>
      </Group>

      <SegmentedControl
        size="xs"
        value={view}
        onChange={(value) => onView(value as SocialCalendarView)}
        data={CALENDAR_VIEWS.map((v) => ({ label: v.label, value: v.value }))}
      />
    </Group>
  );
};
