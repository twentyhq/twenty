export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  STARTED = 'started',
  TRANSFER = 'transfer',
  END = 'end',
  ONHOLD = 'onhold',
  FB_RESPONSE = 'RESPONSE',
}

export type UnreadMessages = {
  unreadMine: number;
  unreadUnassigned: number;
  unreadAbandoned: number;
};
