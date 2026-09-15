import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { type InboxListLocation } from '@/inbox/types/InboxListLocation';

export const getInboxItemPath = ({
  inboxSectionSlug,
  inboxQueueName,
  inboxItemId,
}: InboxListLocation & { inboxItemId: string }): string =>
  isDefined(inboxQueueName)
    ? getAppPath(AppPath.InboxQueueItemPage, { inboxQueueName, inboxItemId })
    : getAppPath(AppPath.InboxItemPage, {
        inboxSectionSlug: inboxSectionSlug ?? DEFAULT_INBOX_SECTION.slug,
        inboxItemId,
      });
