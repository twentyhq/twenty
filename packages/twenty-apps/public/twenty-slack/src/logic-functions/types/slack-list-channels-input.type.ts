export type SlackChannelType = 'Public' | 'Private' | 'All';

export type SlackListChannelsInput = {
  channelType?: SlackChannelType;
  excludeArchived?: boolean;
  limit?: number;
};
