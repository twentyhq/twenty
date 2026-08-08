import { type InboxSection } from '@/inbox/constants/InboxSections';

export const getInboxSectionPath = (inboxSection: InboxSection): string =>
  `/inbox/${inboxSection.slug}`;
