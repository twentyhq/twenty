/* oxlint-disable twenty/no-hardcoded-colors -- the per-network status colors
   (green ok / red error) and the FAILED alarm red are semantic status constants
   mirrored from the pill language (§7), not theme tokens. */
import { ActionIcon, Badge, Button, Group, Text, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  type PanInfo,
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion';
import {
  type IconComponent,
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconHeart,
  IconHome,
  IconMessage,
  IconPencil,
  IconPhoto,
  IconRefresh,
  IconSend,
  IconShare,
  IconShield,
  IconTrash,
  IconVideo,
  IconX,
} from 'twenty-ui/display';
import {
  StyledDrawerBackdrop,
  StyledDrawerOverlay,
  StyledDrawerPanel,
} from '@/propel/components/calendar/postDetailStyles';
import {
  CHANNEL_META,
  FAILED_FILL,
  STATUS_META,
} from '@/propel/lib/socialCalendarConfig';
import {
  type NetworkResult,
  buildPostizLiveUrl,
  buildTimeline,
  formatDateTime,
  formatMetric,
  overallError,
  parseMediaRefs,
  parsePerNetworkResults,
  resolveListingName,
} from '@/propel/lib/socialPostDetail';
import {
  type SaveOutcome,
  isoToLocalInput,
  localInputToIso,
} from '@/propel/lib/socialComposer';
import { type DeleteOutcome } from '@/propel/lib/socialReschedule';
import {
  type SocialListing,
  type SocialNetwork,
  type SocialPost,
} from '@/propel/types/socialCalendar';

// The post-detail drawer (§4.5 / §5 / §7 / §15). Opens from a calendar pill click;
// works for ALL statuses, content adapts. The READ surface (S2) is pure; the
// mutating footer actions are wired in S3 (Edit) and S4 (Reschedule inline,
// Publish now, Delete inline-confirm, Duplicate). The ONLY remaining stub is
// FAILED → Retry, which needs a NEW server retry route (save-post returns
// ILLEGAL_TRANSITION for FAILED) — a separate cross-plane follow-up. It stays
// present-but-disabled with a "soon" hint until that route exists.
//
// Motion (§15): the drawer enters translateX(100%)→0 on --ease-drawer ~320ms and
// exits faster (~220ms); the backdrop fades; sections stagger in on first open.
// Swipe-right dismisses (velocity-based). prefers-reduced-motion → fade, no slide.
// An in-flight footer action crossfades its label (the spinner) — no hard swap.

const EASE_DRAWER: [number, number, number, number] = [0.32, 0.72, 0, 1];
const ENTER_S = 0.32;
const EXIT_S = 0.22;

// Status → footer "action set". Which buttons appear is status-aware (§4.5).
// All are wired in S4 EXCEPT `retry` (still stubbed — see header note).
type FooterAction =
  | 'edit'
  | 'reschedule'
  | 'publish'
  | 'retry'
  | 'delete'
  | 'duplicate';

const FOOTER_BY_STATUS: Record<SocialPost['status'], FooterAction[]> = {
  DRAFT: ['edit', 'publish', 'delete'],
  SCHEDULED: ['edit', 'reschedule', 'publish', 'delete'],
  PUBLISHING: [], // cron owns it — no operator actions
  POSTED: ['duplicate'],
  FAILED: ['retry', 'delete'],
};

const ACTION_META: Record<
  FooterAction,
  { label: string; Icon: IconComponent; danger?: boolean }
> = {
  edit: { label: 'Edit', Icon: IconPencil },
  reschedule: { label: 'Reschedule', Icon: IconCalendar },
  publish: { label: 'Publish now', Icon: IconSend },
  retry: { label: 'Retry', Icon: IconRefresh },
  delete: { label: 'Delete', Icon: IconTrash, danger: true },
  duplicate: { label: 'Duplicate', Icon: IconCopy },
};

const NetworkChip = ({ network }: { network: SocialNetwork }) => {
  const meta = CHANNEL_META[network];
  const Icon = meta.Icon;
  return (
    <Badge
      variant="light"
      size="sm"
      radius="sm"
      leftSection={<Icon size={12} style={{ color: meta.color }} />}
      styles={{ root: { textTransform: 'none' } }}
    >
      {meta.label}
    </Badge>
  );
};

// Map a per-network publish status string to a semantic color + glyph. The
// backend emits loose strings ("success" / "error" / provider states); we treat
// anything containing "succ"/"ok"/"post"/"publish" as success, "fail"/"err" as
// failure, everything else as neutral/pending.
const networkStatusTone = (
  status: string | null,
): { color: string; label: string; ok: boolean | null } => {
  const s = (status ?? '').toLowerCase();
  if (/succ|posted|publish|complete|ok|done/.test(s))
    return { color: '#2F9E44', label: status ?? 'Posted', ok: true };
  if (/fail|error|reject|denied/.test(s))
    return { color: FAILED_FILL, label: status ?? 'Failed', ok: false };
  return {
    color: 'var(--mantine-color-dimmed)',
    label: status ?? 'Pending',
    ok: null,
  };
};

const sectionVariants = (reduce: boolean, index: number) =>
  reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.18, delay: 0 },
      }
    : {
        initial: { opacity: 0, transform: 'translateY(8px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' },
        transition: {
          duration: 0.22,
          ease: EASE_DRAWER,
          // Stagger 40ms each, total kept < 250ms (§15).
          delay: Math.min(index * 0.04, 0.2),
        },
      };

const Section = ({
  label,
  index,
  reduce,
  children,
}: {
  label: string;
  index: number;
  reduce: boolean;
  children: React.ReactNode;
}) => {
  const v = sectionVariants(reduce, index);
  return (
    <motion.div
      className="propel-drawer-section"
      initial={v.initial}
      animate={v.animate}
      transition={v.transition}
    >
      <div className="propel-drawer-section-label">{label}</div>
      {children}
    </motion.div>
  );
};

export const PostDetailDrawer = ({
  post,
  listings,
  connectUrl,
  onClose,
  onEdit,
  onReschedule,
  onPublishNow,
  onDelete,
  onDuplicate,
}: {
  /** the post to show; null closes the drawer (drives AnimatePresence) */
  post: SocialPost | null;
  listings: SocialListing[] | undefined;
  connectUrl: string | undefined;
  onClose: () => void;
  /** S3: open the composer in edit mode for this (DRAFT/SCHEDULED) post */
  onEdit: (post: SocialPost) => void;
  /** S4: reschedule to a new ISO instant (save-post); returns the server outcome */
  onReschedule: (post: SocialPost, newIso: string) => Promise<SaveOutcome>;
  /** S4: move scheduledAt to now so the publish cron picks it up */
  onPublishNow: (post: SocialPost) => Promise<SaveOutcome>;
  /** S4: delete the post (delete-post route); returns the server outcome */
  onDelete: (post: SocialPost) => Promise<DeleteOutcome>;
  /** S4: open the composer prefilled from this post as a NEW draft */
  onDuplicate: (post: SocialPost) => void;
}) => {
  const reduce = useReducedMotion() ?? false;

  // Esc closes (keyboard = instant; backdrop still fades via exit). Bound only
  // while open.
  useEffect(() => {
    if (post === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [post, onClose]);

  // Swipe-to-dismiss: velocity OR distance past threshold dismisses. §15 says
  // velocity > 0.11 dismisses regardless of distance.
  const handleDragEnd = (_e: unknown, info: PanInfo) => {
    if (info.velocity.x > 220 || info.offset.x > 160) {
      onClose();
    }
  };

  const panelTransition = reduce
    ? { duration: 0.18 }
    : { duration: ENTER_S, ease: EASE_DRAWER };
  const panelExit = reduce
    ? { opacity: 0, transition: { duration: 0.16 } }
    : {
        transform: 'translateX(100%)',
        transition: { duration: EXIT_S, ease: EASE_DRAWER },
      };
  const panelInitial = reduce
    ? { opacity: 0 }
    : { transform: 'translateX(100%)' };
  const panelAnimate = reduce
    ? { opacity: 1 }
    : { transform: 'translateX(0%)' };

  return (
    // AnimatePresence tracks the single keyed overlay element; framer-motion waits
    // for ALL descendant exit animations (backdrop fade + panel slide) before it
    // unmounts the subtree, so the drawer's asymmetric exit (§15) plays out.
    <AnimatePresence>
      {post !== null ? (
        <StyledDrawerOverlay
          key="propel-post-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Post details"
        >
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <StyledDrawerBackdrop onClick={onClose} aria-hidden="true" />
          </motion.div>

          <motion.div
            style={{ position: 'relative', height: '100%', maxWidth: '100vw' }}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
            // Swipe-to-dismiss is cheap on touch; gate the listener to the X axis
            // and snap back if the gesture doesn't pass threshold.
            drag={reduce ? false : 'x'}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.6 }}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}
          >
            <DrawerContent
              post={post}
              listings={listings}
              connectUrl={connectUrl}
              reduce={reduce}
              onClose={onClose}
              onEdit={onEdit}
              onReschedule={onReschedule}
              onPublishNow={onPublishNow}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          </motion.div>
        </StyledDrawerOverlay>
      ) : null}
    </AnimatePresence>
  );
};

// Split out so the post (non-null inside) drives a stable render and the section
// stagger keys off mount (first open only — AnimatePresence remounts per post id).
const DrawerContent = ({
  post,
  listings,
  connectUrl,
  reduce,
  onClose,
  onEdit,
  onReschedule,
  onPublishNow,
  onDelete,
  onDuplicate,
}: {
  post: SocialPost;
  listings: SocialListing[] | undefined;
  connectUrl: string | undefined;
  reduce: boolean;
  onClose: () => void;
  onEdit: (post: SocialPost) => void;
  onReschedule: (post: SocialPost, newIso: string) => Promise<SaveOutcome>;
  onPublishNow: (post: SocialPost) => Promise<SaveOutcome>;
  onDelete: (post: SocialPost) => Promise<DeleteOutcome>;
  onDuplicate: (post: SocialPost) => void;
}) => {
  const status = post.status;
  const statusMeta = STATUS_META[status];
  const StatusIcon = statusMeta.Icon;

  const title =
    post.name !== null && post.name !== ''
      ? post.name
      : post.body !== null && post.body !== ''
        ? post.body.slice(0, 80)
        : 'Untitled post';

  const networks = (post.networks ?? []).filter(
    (n): n is SocialNetwork => CHANNEL_META[n] !== undefined,
  );
  const media = parseMediaRefs(post.mediaRefs);
  const netResults = parsePerNetworkResults(post.perNetworkResults);
  const liveUrl = buildPostizLiveUrl(post.postizPostId, connectUrl);
  const listingName = resolveListingName(post.listingId, listings);
  const timeline = buildTimeline(post);
  const failureMsg = status === 'FAILED' ? overallError(post.perNetworkResults) : null;

  const scheduled = formatDateTime(post.scheduledAt);
  const created = formatDateTime(post.createdAt);
  // Subline: scheduled/published time wins; fall back to created.
  const timeLabel =
    status === 'POSTED'
      ? scheduled !== null
        ? `Published ${scheduled}`
        : null
      : scheduled !== null
        ? `Scheduled for ${scheduled}`
        : null;

  // Engagement is only meaningful for a post that's live.
  const showEngagement = status === 'POSTED';

  const footerActions = FOOTER_BY_STATUS[status];

  // Section index counter for the stagger.
  let si = 0;
  const next = () => si++;

  return (
    <StyledDrawerPanel>
      {/* ── Header: title + status pill; subline + created-by ── */}
      <div
        style={{
          padding: '16px 20px 14px',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap={8} align="center" wrap="nowrap" style={{ minWidth: 0 }}>
            {status === 'PUBLISHING' ? (
              <span
                aria-hidden="true"
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: 'var(--pulse-red, #E0144C)',
                  flex: 'none',
                  animation: reduce
                    ? 'none'
                    : 'propel-detail-pulse 1.6s ease-in-out infinite',
                }}
              />
            ) : (
              <StatusIcon
                size={16}
                style={{ flex: 'none', color: 'var(--mantine-color-dimmed)' }}
              />
            )}
            <Badge
              size="sm"
              radius="sm"
              color={status === 'FAILED' ? 'red' : 'red'}
              variant={status === 'POSTED' ? 'filled' : 'light'}
              styles={{ root: { textTransform: 'none' } }}
            >
              {statusMeta.label}
            </Badge>
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Close"
            onClick={onClose}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <Text fw={700} size="md" mt={10} style={{ lineHeight: 1.25 }}>
          {title}
        </Text>
        {timeLabel !== null ? (
          <Text size="xs" c="dimmed" mt={4}>
            {timeLabel}
          </Text>
        ) : null}
        {created !== null ? (
          <Text size="xs" c="dimmed" mt={2}>
            Created {created}
          </Text>
        ) : null}
      </div>

      {/* ── Scrollable body ── */}
      <div className="propel-drawer-body">
        {/* FAILED banner first (most urgent). */}
        {status === 'FAILED' ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
            transition={{ duration: 0.2, ease: EASE_DRAWER }}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              padding: '10px 12px',
              borderRadius: 10,
              background: 'color-mix(in srgb, #C92A2A 12%, transparent)',
              border: '1px solid color-mix(in srgb, #C92A2A 40%, transparent)',
              marginBottom: 4,
            }}
          >
            <IconAlertTriangle
              size={16}
              style={{ flex: 'none', color: FAILED_FILL, marginTop: 1 }}
            />
            <div style={{ minWidth: 0 }}>
              <Text size="xs" fw={700} c="red">
                Publishing failed
              </Text>
              <Text size="xs" c="dimmed" style={{ wordBreak: 'break-word' }}>
                {failureMsg ?? 'No further detail was reported.'}
              </Text>
            </div>
          </motion.div>
        ) : null}

        {/* Networks */}
        {networks.length > 0 ? (
          <Section label="Channels" index={next()} reduce={reduce}>
            <Group gap={6} wrap="wrap">
              {networks.map((n) => (
                <NetworkChip key={n} network={n} />
              ))}
            </Group>
          </Section>
        ) : null}

        {/* Full body copy */}
        <Section label="Post copy" index={next()} reduce={reduce}>
          {post.body !== null && post.body.trim() !== '' ? (
            <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {post.body}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              No caption.
            </Text>
          )}
        </Section>

        {/* Media gallery */}
        {media.length > 0 ? (
          <Section
            label={`Media (${media.length})`}
            index={next()}
            reduce={reduce}
          >
            <div className="propel-media-grid">
              {media.map((m, i) => (
                <div
                  key={`${m.ref}-${i}`}
                  className={
                    m.url === null
                      ? 'propel-media-tile propel-media-tile--opaque'
                      : 'propel-media-tile'
                  }
                  title={m.ref}
                >
                  {m.url === null ? (
                    <>
                      <IconPhoto size={16} />
                    </>
                  ) : m.isVideo ? (
                    <>
                      <video src={m.url} muted preload="metadata" />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.55)',
                          borderRadius: 4,
                          padding: 2,
                          display: 'inline-flex',
                        }}
                      >
                        <IconVideo size={12} style={{ color: '#fff' }} />
                      </span>
                    </>
                  ) : (
                    <img src={m.url} alt={`Attachment ${i + 1}`} loading="lazy" />
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {/* Published-to / per-network results + view live */}
        {(netResults.length > 0 || liveUrl !== null) && status !== 'DRAFT' ? (
          <Section
            label={status === 'POSTED' ? 'Published to' : 'Network results'}
            index={next()}
            reduce={reduce}
          >
            <NetworkResultsList
              results={netResults}
              networks={networks}
              liveUrl={liveUrl}
            />
            {liveUrl !== null ? (
              <Group mt={10} gap={4}>
                <a
                  className="propel-live-link"
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--pulse-red, #E0144C)',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <IconExternalLink size={13} />
                  View live post
                </a>
              </Group>
            ) : null}
          </Section>
        ) : null}

        {/* Engagement */}
        {showEngagement ? (
          <Section label="Engagement" index={next()} reduce={reduce}>
            <div className="propel-metric-grid">
              <MetricCard
                Icon={IconHeart}
                value={post.likeCount}
                label="Likes"
              />
              <MetricCard
                Icon={IconMessage}
                value={post.commentCount}
                label="Comments"
              />
              <MetricCard
                Icon={IconShare}
                value={post.shareCount}
                label="Shares"
              />
              <MetricCard
                Icon={IconEye}
                value={post.impressionCount}
                label="Views"
              />
            </div>
          </Section>
        ) : null}

        {/* Compliance / provenance */}
        <Section label="Compliance" index={next()} reduce={reduce}>
          <ComplianceRow
            listingId={post.listingId}
            listingName={listingName}
            attestedNoProperty={post.attestedNoProperty}
          />
        </Section>

        {/* Lifecycle timeline */}
        <Section label="Lifecycle" index={next()} reduce={reduce}>
          <div className="propel-timeline">
            {timeline.map((stage) => {
              const at = formatDateTime(stage.at);
              const dotClass = [
                'propel-timeline-dot',
                stage.state === 'done' ? 'propel-timeline-dot--done' : '',
                stage.state === 'current' ? 'propel-timeline-dot--current' : '',
                stage.state === 'failed' ? 'propel-timeline-dot--failed' : '',
                stage.state === 'current' &&
                stage.key === 'PUBLISHING' &&
                !reduce
                  ? 'propel-timeline-dot--pulse'
                  : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <div
                  key={stage.key}
                  className={
                    stage.state === 'pending'
                      ? 'propel-timeline-node propel-timeline-node--pending'
                      : 'propel-timeline-node'
                  }
                >
                  <div className="propel-timeline-rail">
                    <span className={dotClass} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="propel-timeline-label">{stage.label}</div>
                    {at !== null ? (
                      <div className="propel-timeline-time">{at}</div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ── Status-aware footer ── */}
      {footerActions.length > 0 || liveUrl !== null ? (
        <DrawerFooter
          post={post}
          actions={footerActions}
          liveUrl={liveUrl}
          onEdit={onEdit}
          onReschedule={onReschedule}
          onPublishNow={onPublishNow}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ) : null}
    </StyledDrawerPanel>
  );
};

const MetricCard = ({
  Icon,
  value,
  label,
}: {
  Icon: IconComponent;
  value: number | null;
  label: string;
}) => (
  <div className="propel-metric-card">
    <Icon size={15} style={{ color: 'var(--mantine-color-dimmed)' }} />
    <span className="propel-metric-value">{formatMetric(value)}</span>
    <span className="propel-metric-label">{label}</span>
  </div>
);

// Per-network result rows. Prefer the explicit perNetworkResults rows; if the
// route gave none but the post targets networks, fall back to one neutral row per
// targeted network (so a POSTED post still lists its channels honestly).
const NetworkResultsList = ({
  results,
  networks,
  liveUrl: _liveUrl,
}: {
  results: NetworkResult[];
  networks: SocialNetwork[];
  liveUrl: string | null;
}) => {
  const rows: NetworkResult[] =
    results.length > 0
      ? results
      : networks.map((n) => ({ network: n, status: null, error: null }));

  return (
    <div>
      {rows.map((r, i) => {
        const key = (r.network ?? `row-${i}`) + i;
        const net =
          r.network !== null &&
          CHANNEL_META[r.network as SocialNetwork] !== undefined
            ? CHANNEL_META[r.network as SocialNetwork]
            : null;
        const tone = networkStatusTone(r.status);
        const Icon = net?.Icon ?? IconSend;
        return (
          <div key={key} className="propel-net-row">
            <Icon
              size={15}
              style={{
                flex: 'none',
                color: net?.color ?? 'var(--mantine-color-dimmed)',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" fw={600}>
                {net?.label ?? r.network ?? 'Network'}
              </Text>
              {r.error !== null && r.error !== '' ? (
                <Text size="xs" c="dimmed" style={{ wordBreak: 'break-word' }}>
                  {r.error}
                </Text>
              ) : null}
            </div>
            <Group gap={4} wrap="nowrap" style={{ flex: 'none' }}>
              {tone.ok === true ? (
                <IconCheck size={13} style={{ color: tone.color }} />
              ) : tone.ok === false ? (
                <IconAlertTriangle size={13} style={{ color: tone.color }} />
              ) : null}
              <Text size="xs" style={{ color: tone.color }}>
                {tone.label}
              </Text>
            </Group>
          </div>
        );
      })}
    </div>
  );
};

// Compliance / provenance row (§4.5). The status payload carries the listing id +
// the attestation flag, but NOT the Trakheesi permit number/expiry (that lives on
// the listing→permit relation server-side and isn't surfaced by the status
// route). So we show the listing (resolved to a name when possible) and note that
// the Trakheesi permit was verified server-side at save/publish — we never
// fabricate a permit number. (Surfacing the live permit no./expiry needs the
// route to include it — flagged for S3.)
const ComplianceRow = ({
  listingId,
  listingName,
  attestedNoProperty,
}: {
  listingId: string | null;
  listingName: string | null;
  attestedNoProperty: boolean | null;
}) => {
  if (listingId !== null && listingId !== '') {
    return (
      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <IconHome
          size={16}
          style={{ flex: 'none', color: 'var(--mantine-color-dimmed)', marginTop: 1 }}
        />
        <div style={{ minWidth: 0 }}>
          <Text size="sm" fw={600}>
            {listingName ?? 'Linked listing'}
          </Text>
          <Group gap={4} mt={2} wrap="nowrap">
            <IconShield size={12} style={{ color: '#2F9E44', flex: 'none' }} />
            <Text size="xs" c="dimmed">
              Trakheesi permit verified at publish
            </Text>
          </Group>
        </div>
      </div>
    );
  }

  // No listing: the attestation path.
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <IconShield
        size={16}
        style={{
          flex: 'none',
          color: attestedNoProperty === true ? '#2F9E44' : 'var(--mantine-color-dimmed)',
          marginTop: 1,
        }}
      />
      <div style={{ minWidth: 0 }}>
        <Text size="sm" fw={600}>
          No specific property
        </Text>
        <Text size="xs" c="dimmed">
          {attestedNoProperty === true
            ? 'Attested: this post does not advertise a specific property.'
            : 'No listing attached.'}
        </Text>
      </div>
    </div>
  );
};

// The footer's transient interaction mode. 'idle' shows the action buttons;
// 'reschedule' swaps in an inline datetime field; 'confirm-delete' swaps in a
// confirm/cancel pair. Only one inline mode is open at a time.
type FooterMode = 'idle' | 'reschedule' | 'confirm-delete';

// Status-aware footer (S4). Wires every action except FAILED→Retry:
//   • Edit       → opens the composer (DRAFT/SCHEDULED).
//   • Reschedule → inline datetime → save-post(scheduledAt) (DRAFT/SCHEDULED).
//   • Publish now→ save-post(scheduledAt = now) so the cron picks it up.
//   • Delete     → inline confirm → delete-post (DRAFT/SCHEDULED/FAILED).
//   • Duplicate  → opens the composer prefilled (new post, no postId).
//   • Retry      → STUBBED (disabled + "soon"): FAILED can't go through save-post
//                  (ILLEGAL_TRANSITION), so retry needs a NEW server route — a
//                  separate cross-plane follow-up. See the file header.
// A running mutation crossfades its label to a spinner (no hard text swap, §15);
// a failure surfaces the server message inline AND the page toasts it; on success
// the page closes the drawer + refreshes the calendar.
const DrawerFooter = ({
  post,
  actions,
  liveUrl,
  onEdit,
  onReschedule,
  onPublishNow,
  onDelete,
  onDuplicate,
}: {
  post: SocialPost;
  actions: FooterAction[];
  liveUrl: string | null;
  onEdit: (post: SocialPost) => void;
  onReschedule: (post: SocialPost, newIso: string) => Promise<SaveOutcome>;
  onPublishNow: (post: SocialPost) => Promise<SaveOutcome>;
  onDelete: (post: SocialPost) => Promise<DeleteOutcome>;
  onDuplicate: (post: SocialPost) => void;
}) => {
  const [mode, setMode] = useState<FooterMode>('idle');
  // Which action is currently mid-flight (drives the per-button spinner + a
  // whole-footer disable so a double mutation can't race).
  const [busy, setBusy] = useState<FooterAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The inline reschedule datetime, seeded from the post's current scheduledAt.
  const [rescheduleLocal, setRescheduleLocal] = useState<string>(() =>
    isoToLocalInput(post.scheduledAt),
  );

  const isReschedulable = post.status === 'DRAFT' || post.status === 'SCHEDULED';

  // Run a mutation: set busy, await the page handler, surface failure inline (the
  // page also toasts). On success the page closes + reloads, so we don't reset
  // local state (the drawer unmounts). On failure we clear busy + show the reason.
  const runPublish = async () => {
    setBusy('publish');
    setError(null);
    const out = await onPublishNow(post);
    if (!out.ok) {
      setBusy(null);
      setError(out.message);
    }
  };

  const runReschedule = async () => {
    const iso = localInputToIso(rescheduleLocal);
    if (iso === null) {
      setError('Pick a valid date and time.');
      return;
    }
    setBusy('reschedule');
    setError(null);
    const out = await onReschedule(post, iso);
    if (!out.ok) {
      setBusy(null);
      setError(out.message);
    }
  };

  const runDelete = async () => {
    setBusy('delete');
    setError(null);
    const out = await onDelete(post);
    if (!out.ok) {
      setBusy(null);
      setError(out.message);
    }
  };

  const onAction = (a: FooterAction) => {
    setError(null);
    if (a === 'edit') {
      onEdit(post);
    } else if (a === 'duplicate') {
      onDuplicate(post);
    } else if (a === 'publish') {
      void runPublish();
    } else if (a === 'reschedule') {
      setRescheduleLocal(isoToLocalInput(post.scheduledAt));
      setMode('reschedule');
    } else if (a === 'delete') {
      setMode('confirm-delete');
    }
    // 'retry' is stubbed → button is disabled, never reaches here.
  };

  const anyBusy = busy !== null;

  return (
    <div
      style={{
        borderTop: '1px solid var(--mantine-color-default-border)',
        background: 'var(--mantine-color-body)',
      }}
    >
      {/* Inline error from the last failed action (e.g. COMPLIANCE_BLOCK). The
          page also toasts it; this keeps it visible next to the action. */}
      {error !== null ? (
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            padding: '10px 20px 0',
          }}
        >
          <IconAlertTriangle
            size={14}
            style={{ flex: 'none', color: FAILED_FILL, marginTop: 2 }}
          />
          <Text size="xs" c="dimmed" style={{ wordBreak: 'break-word' }}>
            {error}
          </Text>
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '12px 20px',
        }}
      >
        {/* ── Inline reschedule mode ── */}
        {mode === 'reschedule' ? (
          <>
            <TextInput
              type="datetime-local"
              size="xs"
              value={rescheduleLocal}
              onChange={(e) => setRescheduleLocal(e.currentTarget.value)}
              disabled={anyBusy}
              style={{ flex: 1, minWidth: 200 }}
              aria-label="New schedule time"
            />
            <Button
              size="xs"
              color="red"
              onClick={() => void runReschedule()}
              loading={busy === 'reschedule'}
              disabled={anyBusy && busy !== 'reschedule'}
              leftSection={<IconCalendar size={14} />}
            >
              Save time
            </Button>
            <Button
              size="xs"
              variant="default"
              onClick={() => {
                setMode('idle');
                setError(null);
              }}
              disabled={anyBusy}
            >
              Cancel
            </Button>
          </>
        ) : mode === 'confirm-delete' ? (
          /* ── Inline delete confirm ── */
          <>
            <Text size="xs" c="dimmed" style={{ flex: 1, minWidth: 160 }}>
              Delete this post? This can’t be undone.
            </Text>
            <Button
              size="xs"
              variant="light"
              color="red"
              onClick={() => void runDelete()}
              loading={busy === 'delete'}
              disabled={anyBusy && busy !== 'delete'}
              leftSection={<IconTrash size={14} />}
            >
              Delete
            </Button>
            <Button
              size="xs"
              variant="default"
              onClick={() => {
                setMode('idle');
                setError(null);
              }}
              disabled={anyBusy}
            >
              Cancel
            </Button>
          </>
        ) : (
          /* ── Idle: the status-aware action set ── */
          <>
            {/* Functional read action: open the live post (POSTED). */}
            {liveUrl !== null ? (
              <Button
                size="xs"
                color="red"
                component="a"
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                leftSection={<IconExternalLink size={14} />}
              >
                View live
              </Button>
            ) : null}

            {actions.map((a) => {
              const meta = ACTION_META[a];
              const Icon = meta.Icon;
              // Retry is the only remaining stub (needs a new server route).
              const stubbed = a === 'retry';
              // Reschedule/edit only make sense for DRAFT/SCHEDULED; FOOTER_BY_STATUS
              // already restricts them, but guard defensively.
              const gated =
                (a === 'reschedule' || a === 'edit') && !isReschedulable;
              const disabled = stubbed || gated || anyBusy;
              const running = busy === a;
              return (
                <Button
                  key={a}
                  size="xs"
                  variant={meta.danger === true ? 'light' : 'default'}
                  color={meta.danger === true ? 'red' : undefined}
                  leftSection={running ? undefined : <Icon size={14} />}
                  loading={running}
                  onClick={() => onAction(a)}
                  disabled={disabled}
                  title={stubbed ? 'Retry is coming soon' : undefined}
                >
                  {meta.label}
                </Button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
