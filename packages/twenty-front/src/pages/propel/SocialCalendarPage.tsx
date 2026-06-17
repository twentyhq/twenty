import { Box, Button, Group, Stack, Tooltip } from '@mantine/core';
import { useMemo, useState } from 'react';
import { IconCalendarEvent, IconPlus } from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { CalendarFilters } from '@/propel/components/calendar/CalendarFilters';
import {
  CalendarEmptyNoChannels,
  CalendarError,
  CalendarLoading,
} from '@/propel/components/calendar/CalendarStates';
import { PostDetailDrawer } from '@/propel/components/calendar/PostDetailDrawer';
import { SocialCalendar } from '@/propel/components/calendar/SocialCalendar';
import { useSocialCalendarData } from '@/propel/hooks/useSocialCalendarData';
import {
  type SocialCalendarEvent,
  type SocialCalendarFilters,
  type SocialCalendarView,
  type SocialPost,
} from '@/propel/types/socialCalendar';

// The graduated Social Posting Calendar hero (P3 hero #5). Rides Twenty's
// DefaultLayout (nav + top bar from the router <Outlet/>); this page owns the
// header + filter bar + native calendar, wrapped in its own Mantine scope.
//
// S1 scope: native Month/Week/List calendar reading socialPost records from
// POST /s/marketing/social/connect { action:'status' }, status-coded pills,
// channel/status filters, and the loading/empty/error states. The post-detail
// drawer (S2), calendar-native CRUD + drag-reschedule (S3), and retry (S4) land
// in later slices — clicking a pill is wired here but its handler is a no-op
// placeholder until S2 supplies the drawer.
export const SocialCalendarPage = () => {
  const { accounts, events, isLoading, loaded, isError, payload, reload } =
    useSocialCalendarData();

  const [view, setView] = useState<SocialCalendarView>('month');
  const [date, setDate] = useState<Date>(() => new Date());
  const [filters, setFilters] = useState<SocialCalendarFilters>({
    networks: [],
    statuses: [],
  });
  // S2: the post selected for the read drawer. null = drawer closed.
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  // Apply channel + status filters. Empty selection on an axis = no filter.
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const post = e.post;
      const networkOk =
        filters.networks.length === 0 ||
        (post.networks ?? []).some((n) => filters.networks.includes(n));
      const statusOk =
        filters.statuses.length === 0 || filters.statuses.includes(post.status);
      return networkOk && statusOk;
    });
  }, [events, filters]);

  const hasChannels = accounts.length > 0;
  const hasAnyPosts = events.length > 0;

  // S2: a pill click opens the post-detail read drawer. The event carries the
  // originating SocialPost (set in useSocialCalendarData → toEvent), so no second
  // lookup is needed; the drawer reads everything from this record + the payload.
  const handleSelectEvent = (event: SocialCalendarEvent) => {
    setSelectedPost(event.post);
  };

  const renderBody = () => {
    // Loading — skeleton grid, never a spinner.
    if (isLoading && payload === null) {
      return <CalendarLoading />;
    }
    // Error — settled fetch returned null (route error / unreachable / denied).
    if (isError && loaded) {
      return <CalendarError onRetry={reload} />;
    }
    // Empty — no connected channels (calendar needs ≥1 to be useful).
    if (loaded && !hasChannels) {
      return <CalendarEmptyNoChannels connectUrl={payload?.connectUrl} />;
    }
    // Populated (or channels-but-no-posts, handled inside SocialCalendar).
    return (
      <Stack gap="md" style={{ flex: 1, minHeight: 0 }}>
        <CalendarFilters filters={filters} onChange={setFilters} />
        <Box style={{ flex: 1, minHeight: 480 }}>
          <SocialCalendar
            events={filteredEvents}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            hasAnyPosts={hasAnyPosts}
          />
        </Box>
      </Stack>
    );
  };

  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader title="Social Calendar" Icon={IconCalendarEvent}>
          <Group gap="sm" wrap="nowrap">
            {/* Compose lands as a calendar-native entry point in S3; surfaced
                here disabled so the header reads complete. */}
            <Tooltip label="Composing from the calendar arrives soon" withArrow>
              <Button
                size="xs"
                color="red"
                leftSection={<IconPlus size={14} />}
                disabled
              >
                Compose
              </Button>
            </Tooltip>
          </Group>
        </PageHeader>

        <Box
          style={{
            padding: '0 16px 24px',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          {renderBody()}
        </Box>
      </PageContainer>

      {/* S2 post-detail read drawer. Overlays the whole page; AnimatePresence
          inside handles enter/exit when selectedPost flips null↔record. Reads
          listings + connectUrl off the same status payload (no new fetch). */}
      <PostDetailDrawer
        post={selectedPost}
        listings={payload?.listings}
        connectUrl={payload?.connectUrl}
        onClose={() => setSelectedPost(null)}
      />
    </PropelMantineProvider>
  );
};
