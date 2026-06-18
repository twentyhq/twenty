import { type EventProps } from 'react-big-calendar';
import { IconPhoto } from 'twenty-ui/display';
import {
  CHANNEL_META,
  FAILED_FILL,
  PILL_TEXT_ON_COLOR,
  primaryChannelColor,
  STATUS_META,
} from '@/propel/lib/socialCalendarConfig';
import { countMedia } from '@/propel/lib/socialPostDetail';
import {
  type SocialCalendarEvent,
  type SocialNetwork,
} from '@/propel/types/socialCalendar';

// react-big-calendar injects { event } into our custom event renderer; alias the
// library generic to satisfy the named-props convention.
type EventPillProps = EventProps<SocialCalendarEvent>;

// A single calendar pill (§6/§7). Channel icon(s) + time + truncated title, with
// a status-coded visual treatment:
//   DRAFT      → dashed outline, muted
//   SCHEDULED  → solid channel-color fill
//   PUBLISHING → solid + pulsing dot (cron owns it)
//   POSTED     → solid + check
//   FAILED     → red + alert glyph
// The wrapper className (rbc-event--<status>) lets the stylesheet hook layout
// states; per-pill color is inline (channel-derived) so multi-channel posts read
// their dominant brand color.
export const EventPill = ({ event }: EventPillProps) => {
  const { post, title } = event;
  const status = post.status;
  const channelColor = primaryChannelColor(post.networks);
  const isSolid =
    status === 'SCHEDULED' || status === 'PUBLISHING' || status === 'POSTED';
  const isFailed = status === 'FAILED';

  const fill = isFailed ? FAILED_FILL : isSolid ? channelColor : 'transparent';
  const textColor =
    isSolid || isFailed ? PILL_TEXT_ON_COLOR : 'var(--mantine-color-text)';
  const border = isFailed
    ? `1px solid ${FAILED_FILL}`
    : status === 'DRAFT'
      ? `1px dashed ${channelColor}`
      : `1px solid ${channelColor}`;
  const opacity = status === 'DRAFT' ? 0.85 : 1;

  const StatusIcon = STATUS_META[status].Icon;
  const networks = (post.networks ?? []).filter(
    (n): n is SocialNetwork => CHANNEL_META[n] !== undefined,
  );
  const media = countMedia(post.mediaRefs);

  const time =
    post.scheduledAt !== null && post.scheduledAt !== ''
      ? new Date(post.scheduledAt).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      : null;

  return (
    <div
      title={`${STATUS_META[status].label} — ${title}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        width: '100%',
        minWidth: 0,
        padding: '2px 6px',
        borderRadius: 6,
        background: fill,
        border,
        opacity,
        color: textColor,
        fontSize: 11,
        lineHeight: 1.3,
        boxSizing: 'border-box',
      }}
    >
      {/* Channel icons (up to 2, then +N) */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          flex: 'none',
        }}
      >
        {networks.slice(0, 2).map((n) => {
          const Icon = CHANNEL_META[n].Icon;
          return (
            <Icon
              key={n}
              size={12}
              style={{
                color:
                  isSolid || isFailed
                    ? PILL_TEXT_ON_COLOR
                    : CHANNEL_META[n].color,
              }}
            />
          );
        })}
        {networks.length > 2 ? (
          <span style={{ fontSize: 9, fontWeight: 700 }}>
            +{networks.length - 2}
          </span>
        ) : null}
      </span>

      {/* Time + title */}
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {time !== null ? (
          <span style={{ fontWeight: 700, marginRight: 4 }}>{time}</span>
        ) : null}
        {title}
      </span>

      {/* Media glyph */}
      {media > 0 ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            flex: 'none',
            opacity: 0.9,
          }}
        >
          <IconPhoto size={11} />
          {media > 1 ? (
            <span style={{ fontSize: 9, fontWeight: 700 }}>{media}</span>
          ) : null}
        </span>
      ) : null}

      {/* Status glyph. PUBLISHING uses a breathing pulse dot; others a static icon. */}
      {status === 'PUBLISHING' ? (
        <span
          aria-label="Publishing"
          style={{
            flex: 'none',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: PILL_TEXT_ON_COLOR,
            animation: 'propel-pill-pulse 1.4s ease-in-out infinite',
          }}
        />
      ) : (
        <StatusIcon
          size={12}
          style={{
            flex: 'none',
            color: isSolid || isFailed ? PILL_TEXT_ON_COLOR : channelColor,
          }}
        />
      )}
    </div>
  );
};
