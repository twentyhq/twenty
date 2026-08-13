// Read from the channel id, not the stored channel type: the id is the one the
// thread is read from and the answer posted to, so it cannot be faked.
export const isSlackDirectMessageChannelId = (channelId: string): boolean =>
  channelId.startsWith('D');
