// https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects
export type LineSource =
  | { type: 'user'; userId: string }
  | { type: 'group'; groupId: string; userId?: string }
  | { type: 'room'; roomId: string; userId?: string };

type LineEventBase = {
  webhookEventId: string;
  timestamp: number;
  mode: 'active' | 'standby';
  source: LineSource;
  deliveryContext: { isRedelivery: boolean };
};

export type LineContentProvider = {
  type: 'line' | 'external';
  originalContentUrl?: string;
  previewImageUrl?: string;
};

type LineMessageBase = {
  id: string;
  quoteToken?: string;
  markAsReadToken?: string;
};

export type LineTextMessage = LineMessageBase & { type: 'text'; text: string };

export type LineImageMessage = LineMessageBase & {
  type: 'image';
  contentProvider: LineContentProvider;
};

export type LineVideoMessage = LineMessageBase & {
  type: 'video';
  contentProvider: LineContentProvider;
};

export type LineAudioMessage = LineMessageBase & {
  type: 'audio';
  contentProvider: LineContentProvider;
};

export type LineFileMessage = LineMessageBase & {
  type: 'file';
  fileName: string;
  fileSize: number;
};

export type LineLocationMessage = LineMessageBase & {
  type: 'location';
  title?: string;
  address?: string;
  latitude: number;
  longitude: number;
};

export type LineStickerMessage = LineMessageBase & {
  type: 'sticker';
  packageId: string;
  stickerId: string;
  keywords?: string[];
  text?: string;
};

export type LineMessage =
  | LineTextMessage
  | LineImageMessage
  | LineVideoMessage
  | LineAudioMessage
  | LineFileMessage
  | LineLocationMessage
  | LineStickerMessage;

export type LineMessageEvent = LineEventBase & {
  type: 'message';
  replyToken?: string;
  message: LineMessage;
};

export type LineUnsendEvent = LineEventBase & {
  type: 'unsend';
  unsend: { messageId: string };
};

type LineUnhandledEvent = LineEventBase & {
  type:
    | 'follow'
    | 'unfollow'
    | 'join'
    | 'leave'
    | 'memberJoined'
    | 'memberLeft'
    | 'postback'
    | 'videoPlayComplete'
    | 'beacon'
    | 'accountLink'
    | 'membership'
    | 'messageEdited';
};

export type LineWebhookEvent =
  | LineMessageEvent
  | LineUnsendEvent
  | LineUnhandledEvent;

export type LineWebhook = {
  destination: string;
  events: LineWebhookEvent[];
};
