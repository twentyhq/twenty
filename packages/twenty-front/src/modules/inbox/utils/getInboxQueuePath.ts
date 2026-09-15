import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const getInboxQueuePath = (inboxQueueName: string): string =>
  getAppPath(AppPath.InboxQueuePage, { inboxQueueName });
