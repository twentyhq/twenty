import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import {
  INBOX_SECTIONS,
  type InboxSection,
} from '@/inbox/constants/InboxSections';

export const findInboxSectionBySlug = (slug?: string): InboxSection =>
  INBOX_SECTIONS.find((inboxSection) => inboxSection.slug === slug) ??
  DEFAULT_INBOX_SECTION;
