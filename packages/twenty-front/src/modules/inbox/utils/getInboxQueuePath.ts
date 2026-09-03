import { AppPath } from 'twenty-shared/types';

export const getInboxQueuePath = (inboxQueueSlug: string): string =>
  `${AppPath.InboxPage}/q/${inboxQueueSlug}`;
