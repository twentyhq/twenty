import { Box, Button, Group, Stack } from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  type CalendarToastState,
  CalendarToast,
} from '@/propel/components/calendar/CalendarToast';
import {
  type ComposerOpen,
  PostComposer,
} from '@/propel/components/calendar/PostComposer';
import { PostDetailDrawer } from '@/propel/components/calendar/PostDetailDrawer';
import { SocialCalendar } from '@/propel/components/calendar/SocialCalendar';
import { useSocialCalendarData } from '@/propel/hooks/useSocialCalendarData';
import { isoToLocalInput } from '@/propel/lib/socialComposer';
import {
  type DeleteOutcome,
  deletePost,
  publishNow,
  reschedulePost,
} from '@/propel/lib/socialReschedule';
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
//   S3 — the compose surface: a two-pane composer reached from the top Compose
//        button, a day-cell "+" (empty-slot click prefills the date), and the
//        detail-drawer Edit action (DRAFT/SCHEDULED). Create + edit both call
//        /marketing/social/save-post and refresh on success.
//   S4 — drag-to-reschedule (this slice): drop a DRAFT/SCHEDULED pill on a new day
//        → optimistic move + save-post(scheduledAt); failure reverts + toasts the
//        server message (incl. a re-run Trakheesi COMPLIANCE_BLOCK). Plus the
//        detail-drawer footer actions: Reschedule (inline), Publish now, Delete
//        (inline confirm), Duplicate (composer prefill). FAILED→Retry stays stubbed
//        pending a new server retry route (save-post rejects FAILED).
// Still stubbed: FAILED→Retry (server route), AI "use listing details" caption.
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
  // S3: the composer's open intent (create / edit / duplicate). null = closed.
  const [composer, setComposer] = useState<ComposerOpen | null>(null);
  // S4: a single self-dismissing toast (reschedule failure / mutation success).
  const [toast, setToast] = useState<CalendarToastState | null>(null);
  // S4: optimistic reschedule overrides — postId → new ISO instant. Applied on top
  // of the fetched events so a dropped pill lands IMMEDIATELY (§15), before the
  // save round-trips. Cleared on success (the reload brings the real value) or on
  // failure (the pill snaps back to its server slot).
  const [optimisticAt, setOptimisticAt] = useState<Record<string, string>>({});

  const showToast = useCallback(
    (tone: CalendarToastState['tone'], message: string) =>
      setToast({ id: Date.now(), tone, message }),
    [],
  );

  // Reconcile optimistic overrides against freshly-fetched truth. Once a refetch
  // lands with the post's scheduledAt at (or past) the override, OR the post is
  // gone, drop the override — keeping it until then avoids a flicker where the
  // pill would snap back to its old slot in the gap between clearing and the
  // reload completing. (A failed reschedule clears its own override immediately.)
  useEffect(() => {
    setOptimisticAt((m) => {
      const ids = Object.keys(m);
      if (ids.length === 0) return m;
      const byId = new Map(events.map((e) => [e.post.id, e.post.scheduledAt]));
      // Compare by epoch (server may echo a different ISO format — millis, +00:00
      // vs Z — for the same instant; a string === would miss it and stick).
      const sameInstant = (a: string, b: string | null | undefined): boolean => {
        if (b === null || b === undefined) return false;
        const ta = new Date(a).getTime();
        const tb = new Date(b).getTime();
        return !Number.isNaN(ta) && !Number.isNaN(tb) && ta === tb;
      };
      let changed = false;
      const next: Record<string, string> = {};
      for (const id of ids) {
        // Drop when the server now reflects the override (reconciled) or the post
        // no longer exists; otherwise keep the optimistic value in place.
        if (!byId.has(id) || sameInstant(m[id], byId.get(id))) {
          changed = true;
        } else {
          next[id] = m[id];
        }
      }
      return changed ? next : m;
    });
  }, [events]);

  // Apply channel + status filters, then layer the optimistic reschedule overrides
  // so a just-dropped pill renders at its new time without waiting for the server.
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const post = e.post;
        const networkOk =
          filters.networks.length === 0 ||
          (post.networks ?? []).some((n) => filters.networks.includes(n));
        const statusOk =
          filters.statuses.length === 0 ||
          filters.statuses.includes(post.status);
        return networkOk && statusOk;
      })
      .map((e) => {
        const override = optimisticAt[e.post.id];
        if (override === undefined) return e;
        const start = new Date(override);
        if (Number.isNaN(start.getTime())) return e;
        const end = new Date(start.getTime() + 30 * 60 * 1000);
        // Mirror the override onto the carried post so the pill's time label and
        // the detail drawer read the optimistic value too.
        return {
          ...e,
          start,
          end,
          post: { ...e.post, scheduledAt: override },
        };
      });
  }, [events, filters, optimisticAt]);

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

  // ── S4 drag-to-reschedule ──────────────────────────────────────────────────
  // A DRAFT/SCHEDULED pill was dropped on a new day. Move it optimistically, then
  // call save-post (which re-runs the FULL server gate, incl. the Trakheesi permit
  // check). On failure we revert + toast the server message (e.g. COMPLIANCE_BLOCK
  // if the listing's permit lapsed); on success we clear the override + reload so
  // the pill reflects the real persisted time.
  const handleReschedule = useCallback(
    (event: SocialCalendarEvent, newStart: Date) => {
      const post = event.post;
      const newIso = newStart.toISOString();

      // Optimistic move (lands immediately).
      setOptimisticAt((m) => ({ ...m, [post.id]: newIso }));

      void reschedulePost(post, newIso).then((outcome) => {
        if (outcome.ok) {
          // Keep the override in place and refetch the truth; the reconciliation
          // effect drops the override once the fresh payload reflects it (no
          // intermediate snap-back flicker).
          reload();
        } else {
          // Revert the pill to its server slot + surface the reason. The
          // operatorAction (when present) is more actionable than the raw error.
          setOptimisticAt((m) => {
            const next = { ...m };
            delete next[post.id];
            return next;
          });
          showToast('error', outcome.operatorAction ?? outcome.message);
        }
      });
    },
    [reload, showToast],
  );

  // ── S4 detail-drawer mutation handlers ─────────────────────────────────────
  // Each returns the server outcome so the drawer can render its own busy/error
  // state; on success we close the drawer + reload here (the drawer unmounts).
  const handleDrawerReschedule = useCallback(
    async (post: SocialPost, newIso: string) => {
      const outcome = await reschedulePost(post, newIso);
      if (outcome.ok) {
        setSelectedPost(null);
        reload();
        showToast('success', 'Post rescheduled.');
      } else {
        showToast('error', outcome.operatorAction ?? outcome.message);
      }
      return outcome;
    },
    [reload, showToast],
  );

  const handlePublishNow = useCallback(
    async (post: SocialPost) => {
      const outcome = await publishNow(post);
      if (outcome.ok) {
        setSelectedPost(null);
        reload();
        showToast('success', 'Queued — the next publish run will post this.');
      } else {
        showToast('error', outcome.operatorAction ?? outcome.message);
      }
      return outcome;
    },
    [reload, showToast],
  );

  const handleDelete = useCallback(
    async (post: SocialPost): Promise<DeleteOutcome> => {
      const outcome = await deletePost(post.id);
      if (outcome.ok) {
        setSelectedPost(null);
        reload();
        showToast('success', 'Post deleted.');
      } else {
        showToast('error', outcome.operatorAction ?? outcome.message);
      }
      return outcome;
    },
    [reload, showToast],
  );

  // Duplicate → open the composer prefilled from the post as a NEW draft (no
  // postId). Close the drawer so the two surfaces don't stack.
  const handleDuplicate = useCallback((post: SocialPost) => {
    setSelectedPost(null);
    setComposer({ kind: 'duplicate', source: post });
  }, []);

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
            onReschedule={handleReschedule}
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

      {/* Post-detail drawer. Overlays the whole page; AnimatePresence inside
          handles enter/exit when selectedPost flips null↔record. Reads listings +
          connectUrl off the same status payload (no new fetch). S3 wires Edit; S4
          wires Reschedule (inline) / Publish now / Delete (inline confirm) /
          Duplicate. The handlers close the drawer + reload on success and toast
          the outcome (incl. a re-run COMPLIANCE_BLOCK). */}
      <PostDetailDrawer
        post={selectedPost}
        listings={listings}
        connectUrl={connectUrl}
        onClose={() => setSelectedPost(null)}
        onEdit={handleEditFromDrawer}
        onReschedule={handleDrawerReschedule}
        onPublishNow={handlePublishNow}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
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

      {/* S4 toast — surfaces a drag-reschedule failure (the server's
          COMPLIANCE_BLOCK / error message) and confirms drawer mutations. Single,
          self-dismissing; lives inside the Mantine scope so it reads CRM tokens. */}
      <CalendarToast toast={toast} onDismiss={() => setToast(null)} />
    </PropelMantineProvider>
  );
};
