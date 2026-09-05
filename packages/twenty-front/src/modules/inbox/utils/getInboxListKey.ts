import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';

export const getInboxListKey = ({
  inboxSectionSlug,
  inboxQueueSlug,
}: InboxListLocation): string =>
  isDefined(inboxQueueSlug)
    ? `queue:${inboxQueueSlug}`
    : `section:${inboxSectionSlug ?? DEFAULT_INBOX_SECTION.slug}`;
