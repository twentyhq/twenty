// ordered by progress, so a late delivery receipt never moves a read message back
export const MESSENGER_MESSAGE_STATUSES = ['DELIVERED', 'READ'] as const;

