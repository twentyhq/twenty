export type LastEvent =
  | 'SENT'
  | 'DELIVERED'
  | 'DELIVERY_DELAYED'
  | 'COMPLAINED'
  | 'BOUNCED'
  | 'OPENED'
  | 'CLICKED';

const VALID_LAST_EVENTS = new Set<LastEvent>([
  'SENT',
  'DELIVERED',
  'DELIVERY_DELAYED',
  'COMPLAINED',
  'BOUNCED',
  'OPENED',
  'CLICKED',
]);

export const mapLastEvent = (lastEvent: string): LastEvent => {
  const mapped = lastEvent.replace('email.', '').toUpperCase();

  return VALID_LAST_EVENTS.has(mapped as LastEvent)
    ? (mapped as LastEvent)
    : 'SENT';
};
