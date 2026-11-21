// reference: https://developers.facebook.com/docs/messenger-platform/webhooks
export type MessengerWebhookAttachment = {
  type: 'image' | 'video' | 'audio' | 'file' | 'fallback' | 'template' | string;
  payload?: { url?: string; title?: string; sticker_id?: number };
};

export type MessengerWebhookMessage = {
  mid: string;
  text?: string;
  is_echo?: boolean;
  attachments?: MessengerWebhookAttachment[];
};

export type MessengerMessagingEvent = {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: MessengerWebhookMessage;
};

export type MessengerWebhook = {
  object: string;
  entry?: {
    id: string;
    time: number;
    messaging?: MessengerMessagingEvent[];
  }[];
};
