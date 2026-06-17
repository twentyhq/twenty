import { Box, Button, Group, Stack } from '@mantine/core';
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
import {
  type ComposerOpen,
  PostComposer,
} from '@/propel/components/calendar/PostComposer';
import { PostDetailDrawer } from '@/propel/components/calendar/PostDetailDrawer';
import { SocialCalendar } from '@/propel/components/calendar/SocialCalendar';
import { useSocialCalendarData } from '@/propel/hooks/useSocialCalendarData';
import { isoToLocalInput } from '@/propel/lib/socialComposer';
import {
  type SocialCalendarEvent,
  type SocialCalendarFilters,
  type SocialCalendarView,
  type SocialPost,
} from '@/propel/types/socialCalendar';

// Default schedule time for a day-cell "+" prefill: 9 AM local on the picked day
// (a sensible posting hour; the composer datetime field stays editable).
const slotToScheduleLocal = (slotStart: Date): string => {
  const d = new Date(slotStart);
  d.setHours(9, 0, 0, 0);
  return isoToLocalInput(d.toISOString());
};

// The graduated Social Posting Calendar hero (P3 hero #5). Rides Twenty's
// DefaultLayout (nav + top bar from the router <Outlet/>); this page owns the
// header + filter bar + native calendar, wrapped in its own Mantine scope.
//
// Slices landed:
//   S1 — native Month/Week/List calendar reading socialPost records from
//        POST /s/marketing/social/connect { action:'status' }, status pills,
//        channel/status filters, loading/empty/error states.
//   S2 — post-detail READ drawer (pill click) for all statuses.
//   S3 — the compose surface (this slice): a two-pane composer reached from the
//        top Compose button, a day-cell "+" (empty-slot click prefills the date),
//        and the detail-drawer Edit/Reschedule action (DRAFT/SCHEDULED). Create +
//        edit both call /marketing/social/save-post and refresh on success.
// Still stubbed: drag-to-reschedule + publish/retry/delete from the drawer (S4),
// and the AI "use listing details" caption (the AI slice).
export const SocialCalendarPage = () => {
  const {
    accounts,
    events,
    listings,
    connectUrl,
    connectedNetworks,
    isLoading,
    loaded,
    isError,
    payload,
    reload,
  } = useSocialCalendarData();

  const [view, setView] = useState<SocialCalendarView>('month');
  const [date, setDate] = useState<Date>(() => new Date());
  const [filters, setFilters] = useState<SocialCalendarFilters>({
    networks: [],
    statuses: [],
  });
  // S2: the post selected for the read drawer. null = drawer closed.
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  // S3: the composer's open intent (create / edit). null = composer closed.
  const [composer, setComposer] = useState<ComposerOpen | null>(null);

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

  // ── S3 compose entry points ───────────────────────────────────────────────
  // Top "Compose" button → blank create.
  const openCompose = () => setComposer({ kind: 'create' });

  // Day-cell "+" (an empty-slot click) → create prefilled with that day @ 9 AM.
  const handleSelectSlot = (slotStart: Date) => {
    setComposer({
      kind: 'create',
      prefillScheduledLocal: slotToScheduleLocal(slotStart),
    });
  };

  // Detail-drawer "Edit" → open the composer in edit mode and close the drawer so
  // the two surfaces don't stack (the composer overlays at a higher z anyway).
  const handleEditFromDrawer = (post: SocialPost) => {
    setSelectedPost(null);
    setComposer({ kind: 'edit', post });
  };

  // On a successful create/edit, close the composer and refresh the calendar so
  // the new/edited pill appears.
  const handleSaved = () => {
    setComposer(null);
    reload();
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
            onSelectSlot={handleSelectSlot}
            onCompose={openCompose}
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
            {/* S3: the top Compose entry point. Enabled once there's at least one
                connected channel (the composer needs a network to target). */}
            <Button
              size="xs"
              color="red"
              leftSection={<IconPlus size={14} />}
              onClick={openCompose}
              disabled={!hasChannels}
            >
              Compose
            </Button>
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
          listings + connectUrl off the same status payload (no new fetch). S3
          wires its Edit/Reschedule actions to open the composer (DRAFT/SCHEDULED). */}
      <PostDetailDrawer
        post={selectedPost}
        listings={listings}
        connectUrl={connectUrl}
        onClose={() => setSelectedPost(null)}
        onEdit={handleEditFromDrawer}
      />

      {/* S3 compose surface. A right-side two-pane panel (form + live preview).
          Handles create (top Compose / day-cell +) and edit (from the drawer).
          On save it closes + reloads the calendar so the new pill appears. */}
      <PostComposer
        open={composer}
        connectedNetworks={connectedNetworks}
        listings={listings}
        onClose={() => setComposer(null)}
        onSaved={handleSaved}
      />
    </PropelMantineProvider>
  );
};
