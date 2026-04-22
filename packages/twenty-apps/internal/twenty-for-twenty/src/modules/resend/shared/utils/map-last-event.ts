import { isDefined } from 'twenty-shared/utils';

export type LastEvent =
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

const EVENT_TO_LAST_EVENT: Record<string, LastEvent> = {
  sent: 'SENT',
  delivered: 'DELIVERED',
  delivery_delayed: 'DELIVERY_DELAYED',
  complained: 'COMPLAINED',
  bounced: 'BOUNCED',
  opened: 'OPENED',
  clicked: 'CLICKED',
  scheduled: 'SCHEDULED',
  queued: 'QUEUED',
  failed: 'FAILED',
  canceled: 'CANCELED',
  received: 'RECEIVED',
  suppressed: 'SUPPRESSED',
};

export const mapLastEvent = (lastEvent: string): LastEvent | null => {
  const key = lastEvent.replace(/^email\./, '').toLowerCase();
  const mapped = EVENT_TO_LAST_EVENT[key];

  if (!isDefined(mapped)) {
    console.warn(`[resend] Unknown email event: ${lastEvent}`);

    return null;
  }

  return mapped;
};
