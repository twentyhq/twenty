import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';

export const getInboxListKey = ({
  inboxSectionSlug,
  inboxQueueName,
}: InboxListLocation): string =>
  isDefined(inboxQueueName)
    ? `queue:${inboxQueueName}`
    : `section:${inboxSectionSlug ?? DEFAULT_INBOX_SECTION.slug}`;
