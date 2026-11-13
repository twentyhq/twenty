export type InboxThreadStatusScope =
  | { type: 'personal' }
  | { type: 'channel'; channelId: string; channelName: string };
