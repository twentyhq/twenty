// reference: https://developers.facebook.com/docs/messenger-platform/webhooks
export type MessengerWebhookAttachment = {
  type: string;
  payload?: { url?: string; title?: string; sticker_id?: number };
};

// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_referrals
export type MessengerReferral = {
  source?: string;
  type?: string;
  ref?: string;
  ad_id?: string;
  ads_context_data?: { ad_title?: string };
};

export type MessengerWebhookMessage = {
  mid: string;
  text?: string;
  is_echo?: boolean;
  attachments?: MessengerWebhookAttachment[];
  referral?: MessengerReferral;
};

// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-edits
export type MessengerMessageEdit = {
  mid: string;
  text: string;
  num_edit: number;
};

// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messaging_postbacks
export type MessengerPostback = {
  mid?: string;
  title?: string;
  payload?: string;
  referral?: MessengerReferral;
};

// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-deliveries
export type MessengerDelivery = {
  mids?: string[];
  watermark: number;
};

// https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/message-reads
export type MessengerRead = {
  watermark: number;
};

// delivery events carry no timestamp of their own
export type MessengerMessagingEvent = {
  sender: { id: string };
  recipient: { id: string };
  timestamp?: number;
  delivery?: MessengerDelivery;
  read?: MessengerRead;
  message?: MessengerWebhookMessage;
  message_edit?: MessengerMessageEdit;
  postback?: MessengerPostback;
  referral?: MessengerReferral;
};

export type MessengerWebhook = {
  object: string;
  entry?: {
    id: string;
    time: number;
    messaging?: MessengerMessagingEvent[];
  }[];
};
