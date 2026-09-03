import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const getInboxQueuePath = (inboxQueueSlug: string): string =>
  getAppPath(AppPath.InboxQueuePage, { inboxQueueSlug });
