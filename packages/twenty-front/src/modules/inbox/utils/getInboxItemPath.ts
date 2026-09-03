import { AppPath } from 'twenty-shared/types';

import { type InboxSection } from '@/inbox/constants/InboxSections';

export const getInboxItemPath = (
  inboxSection: InboxSection,
  inboxItemId: string,
): string => `${AppPath.InboxPage}/${inboxSection.slug}/${inboxItemId}`;
