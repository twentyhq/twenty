export type ThemeColor =
  | 'red'
  | 'ruby'
  | 'crimson'
  | 'tomato'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'grass'
  | 'green'
  | 'jade'
  | 'mint'
  | 'turquoise'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'iris'
  | 'violet'
  | 'purple'
  | 'plum'
  | 'pink'
  | 'bronze'
  | 'gold'
  | 'brown'
  | 'gray';

export type ResendEmailStatus =
  | 'SENT'
  | 'DELIVERED'
  | 'DELIVERY_DELAYED'
  | 'COMPLAINED'
  | 'BOUNCED'
  | 'OPENED'
  | 'CLICKED'
  | 'SCHEDULED'
  | 'QUEUED'
  | 'FAILED'
  | 'CANCELED'
  | 'RECEIVED'
  | 'SUPPRESSED';

export type EmailStatusGroup = 'reached' | 'failed' | 'inFlight' | 'other';

export const EMAIL_STATUS_GROUP_BY_STATUS: Record<
  ResendEmailStatus,
  EmailStatusGroup
> = {
  DELIVERED: 'reached',
  OPENED: 'reached',
  CLICKED: 'reached',
  BOUNCED: 'failed',
  FAILED: 'failed',
  COMPLAINED: 'failed',
  SUPPRESSED: 'failed',
  SENT: 'inFlight',
  QUEUED: 'inFlight',
  SCHEDULED: 'inFlight',
  DELIVERY_DELAYED: 'inFlight',
  CANCELED: 'other',
  RECEIVED: 'other',
};

export type EmailStatusMeta = {
  label: string;
  color: ThemeColor;
};

export const EMAIL_STATUS_META_BY_STATUS: Record<
  ResendEmailStatus,
  EmailStatusMeta
> = {
  SENT: { label: 'Sent', color: 'blue' },
  DELIVERED: { label: 'Delivered', color: 'green' },
  DELIVERY_DELAYED: { label: 'Delivery Delayed', color: 'yellow' },
  COMPLAINED: { label: 'Complained', color: 'orange' },
  BOUNCED: { label: 'Bounced', color: 'red' },
  OPENED: { label: 'Opened', color: 'turquoise' },
  CLICKED: { label: 'Clicked', color: 'sky' },
  SCHEDULED: { label: 'Scheduled', color: 'gray' },
  QUEUED: { label: 'Queued', color: 'gray' },
  FAILED: { label: 'Failed', color: 'red' },
  CANCELED: { label: 'Canceled', color: 'gray' },
  RECEIVED: { label: 'Received', color: 'blue' },
  SUPPRESSED: { label: 'Suppressed', color: 'red' },
};

export const RESEND_EMAIL_STATUS_DISPLAY_ORDER: ReadonlyArray<ResendEmailStatus> =
  [
    'DELIVERED',
    'OPENED',
    'CLICKED',
    'SENT',
    'QUEUED',
    'SCHEDULED',
    'DELIVERY_DELAYED',
    'BOUNCED',
    'COMPLAINED',
    'SUPPRESSED',
    'FAILED',
    'CANCELED',
    'RECEIVED',
  ];

export const isResendEmailStatus = (
  value: string | null | undefined,
): value is ResendEmailStatus =>
  typeof value === 'string' && value in EMAIL_STATUS_GROUP_BY_STATUS;
