// WhatsApp timestamps are Unix seconds, sent as a string or a number depending on the webhook
export const parseWhatsAppTimestamp = (timestamp: string | number): Date =>
  new Date(Number(timestamp) * 1000);
