// ordered by progress, so a status that arrives late never moves a message backwards
export const WHATSAPP_MESSAGE_STATUSES = ['sent', 'delivered', 'read', 'failed'] as const;
