/* oxlint-disable twenty/no-hardcoded-colors -- channel brand colors (Facebook
   blue, Instagram magenta, LinkedIn blue, TikTok black) + the Pulse accent red
   are external brand constants, not theme tokens; they must match each platform. */
import {
  type IconComponent,
  IconAlertTriangle,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconCheck,
  IconCircleDot,
  IconClock,
  IconLoader,
} from 'twenty-ui/display';
import {
  type SocialCalendarView,
  type SocialNetwork,
  type SocialPostStatus,
} from '@/propel/types/socialCalendar';

// Visual language for the Social Posting Calendar hero. Single source of truth
// for channel colors/icons (§7) and status tints, plus the §15 motion tokens so
// every surface shares ONE easing family.

export const CHANNEL_META: Record<
  SocialNetwork,
  { label: string; color: string; Icon: IconComponent }
> = {
  FACEBOOK: { label: 'Facebook', color: '#1877F2', Icon: IconBrandFacebook },
  INSTAGRAM: { label: 'Instagram', color: '#E1306C', Icon: IconBrandInstagram },
  LINKEDIN: { label: 'LinkedIn', color: '#0A66C2', Icon: IconBrandLinkedin },
  TIKTOK: { label: 'TikTok', color: '#010101', Icon: IconBrandTiktok },
};

export const ALL_NETWORKS: SocialNetwork[] = [
  'FACEBOOK',
  'INSTAGRAM',
  'LINKEDIN',
  'TIKTOK',
];

// Pill rendering constants (defined here, in the brand-color-exempt module, so
// the rest of the hero stays token-only). FAILED_FILL is the alarm red; a solid
// pill paints brand color so its text must be white for contrast. PULSE_RED is
// the RE/MAX Hub accent, interpolated into the calendar stylesheet.
export const FAILED_FILL = '#C92A2A';
export const PILL_TEXT_ON_COLOR = '#ffffff';
export const PULSE_RED = '#E0144C';

// Status visual treatment per spec §7. `tone` keys into Mantine/CSS color usage;
// the calendar CSS (socialCalendarStyles) keys pill appearance off the
// `rbc-event-<status>` className this maps to.
export const STATUS_META: Record<
  SocialPostStatus,
  { label: string; Icon: IconComponent; className: string }
> = {
  DRAFT: { label: 'Draft', Icon: IconCircleDot, className: 'rbc-event--draft' },
  SCHEDULED: {
    label: 'Scheduled',
    Icon: IconClock,
    className: 'rbc-event--scheduled',
  },
  PUBLISHING: {
    label: 'Publishing',
    Icon: IconLoader,
    className: 'rbc-event--publishing',
  },
  POSTED: { label: 'Posted', Icon: IconCheck, className: 'rbc-event--posted' },
  FAILED: {
    label: 'Failed',
    Icon: IconAlertTriangle,
    className: 'rbc-event--failed',
  },
};

export const ALL_STATUSES: SocialPostStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHING',
  'POSTED',
  'FAILED',
];

export const CALENDAR_VIEWS: { value: SocialCalendarView; label: string }[] = [
  { value: 'month', label: 'Month' },
  { value: 'week', label: 'Week' },
  { value: 'agenda', label: 'List' },
];

// Pick the dominant channel color for a post (first selected network) — drives
// the SCHEDULED solid pill fill and the channel rail on multi-network posts.
export const primaryChannelColor = (
  networks: SocialNetwork[] | null,
): string => {
  const first = networks?.find((n) => CHANNEL_META[n] !== undefined);
  return first !== undefined ? CHANNEL_META[first].color : PULSE_RED;
};

// §15 motion tokens — exported so any surface in the hero shares the same
// easing family + durations (cohesion rule). Used inline + in the CSS string.
export const MOTION = {
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
  easeInOut: 'cubic-bezier(0.77, 0, 0.175, 1)',
  easeDrawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
  press: '140ms',
  pill: '160ms',
  filter: '180ms',
  viewSwitch: '240ms',
} as const;
