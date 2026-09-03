import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { type InboxSection } from '@/inbox/constants/InboxSections';

export const getInboxItemPath = (
  inboxSection: InboxSection,
  inboxItemId: string,
): string =>
  getAppPath(AppPath.InboxItemPage, {
    inboxSectionSlug: inboxSection.slug,
    inboxItemId,
  });
