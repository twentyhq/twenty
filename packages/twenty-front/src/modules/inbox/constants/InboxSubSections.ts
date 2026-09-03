import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { INBOX_SECTIONS } from '@/inbox/constants/InboxSections';

// Snoozed and Done are places an item goes, not peers of the inbox itself, so
// they hang under it rather than sitting alongside it. Derived from the
// default rather than by position, so reordering the sections cannot quietly
// change the navigation structure.
export const INBOX_SUB_SECTIONS = INBOX_SECTIONS.filter(
  (inboxSection) => inboxSection.slug !== DEFAULT_INBOX_SECTION.slug,
);
