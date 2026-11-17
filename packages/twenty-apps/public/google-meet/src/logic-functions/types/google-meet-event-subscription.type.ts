export type GoogleMeetEventSubscription = {
  name: string;
  state?: 'STATE_UNSPECIFIED' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  expireTime?: string;
  suspensionReason?: string;
  notificationEndpoint?: { pubsubTopic?: string };
  eventTypes?: string[];
};
