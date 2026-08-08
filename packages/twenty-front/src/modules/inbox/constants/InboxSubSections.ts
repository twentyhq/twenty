import { INBOX_SECTIONS } from '@/inbox/constants/InboxSections';

// Snoozed and Done are places an item goes, not peers of the inbox itself, so
// they hang under it rather than sitting alongside it.
export const INBOX_SUB_SECTIONS = INBOX_SECTIONS.slice(1);
