import { Button, Center, Stack, Text } from '@mantine/core';
import { IconCalendarEvent, IconPlug, IconRefresh } from 'twenty-ui/display';
import { StyledSocialCalendarSkeleton } from '@/propel/components/calendar/socialCalendarStyles';

// Loading — a calendar-shaped skeleton grid with a shimmer sweep, NOT a spinner
// (§5 / §15). 42 cells = a 6-week month grid.
export const CalendarLoading = () => (
  <StyledSocialCalendarSkeleton aria-busy="true" aria-label="Loading calendar">
    {Array.from({ length: 42 }).map((_, i) => (
      <div
        key={i}
        className="skel-cell"
        style={{ animationDelay: `${(i % 7) * 40}ms` }}
      />
    ))}
  </StyledSocialCalendarSkeleton>
);

// Error — load failed, inline, with Retry. No movement (§15: just fade in via
// the parent's view crossfade).
export const CalendarError = ({ onRetry }: { onRetry: () => void }) => (
  <Center mih={360} h="100%">
    <Stack gap="md" align="center" maw={320}>
      <Text size="sm" c="dimmed" ta="center">
        Couldn’t load your posting calendar.
      </Text>
      <Button
        variant="default"
        leftSection={<IconRefresh size={14} />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </Stack>
  </Center>
);

// Empty — no connected channels yet. CTA bounces to Postiz for the one-time
// channel connect (the only residual Postiz touch, per spec §1).
export const CalendarEmptyNoChannels = ({
  connectUrl,
}: {
  connectUrl?: string;
}) => (
  <Center mih={360} h="100%">
    <Stack gap="sm" align="center" maw={360}>
      <IconPlug size={28} style={{ color: 'var(--mantine-color-dimmed)' }} />
      <Text fw={600} size="sm" ta="center">
        Connect a channel first
      </Text>
      <Text size="xs" c="dimmed" ta="center">
        Link a Facebook, Instagram, LinkedIn, or TikTok account to start
        scheduling posts on your calendar.
      </Text>
      {connectUrl !== undefined && connectUrl !== '' ? (
        <Button
          size="xs"
          color="red"
          component="a"
          href={connectUrl}
          target="_blank"
          rel="noreferrer"
        >
          Connect a channel
        </Button>
      ) : null}
    </Stack>
  </Center>
);

// Empty — channels connected, but no posts in range. Friendly compose CTA. The
// compose entry point itself lands in a later slice; for S1 this is informational.
export const CalendarEmptyNoPosts = () => (
  <Center mih={240}>
    <Stack gap="xs" align="center" maw={320}>
      <IconCalendarEvent
        size={26}
        style={{ color: 'var(--mantine-color-dimmed)' }}
      />
      <Text fw={600} size="sm" ta="center">
        No posts scheduled
      </Text>
      <Text size="xs" c="dimmed" ta="center">
        Nothing on the calendar for this period yet. Compose your first post to
        see it here.
      </Text>
    </Stack>
  </Center>
);
