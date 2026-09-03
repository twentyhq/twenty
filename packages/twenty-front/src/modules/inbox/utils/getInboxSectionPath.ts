import { AppPath } from 'twenty-shared/types';

import { type InboxSection } from '@/inbox/constants/InboxSections';

export const getInboxSectionPath = (inboxSection: InboxSection): string =>
  `${AppPath.InboxPage}/${inboxSection.slug}`;
