import { type InboxSection } from '@/inbox/constants/InboxSections';

export const getInboxItemPath = (
  inboxSection: InboxSection,
  inboxItemId: string,
): string => `/inbox/${inboxSection.slug}/${inboxItemId}`;
