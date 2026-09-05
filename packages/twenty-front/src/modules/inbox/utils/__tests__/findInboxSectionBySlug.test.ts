import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { InboxItemScope } from '~/generated/graphql';

describe('findInboxSectionBySlug', () => {
  it('should return the matching section when the slug is known', () => {
    const inboxSection = findInboxSectionBySlug('snoozed');

    expect(inboxSection.scope).toBe(InboxItemScope.SNOOZED);
  });

  it('should fall back to the default section when the slug is unknown', () => {
    const inboxSection = findInboxSectionBySlug('nope');

    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });

  it('should fall back to the default section when no slug is given', () => {
    const inboxSection = findInboxSectionBySlug();

    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });

  it('should fall back to the default section when the slug is empty', () => {
    const inboxSection = findInboxSectionBySlug('');

    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });

  it('should not match a slug that differs only by case', () => {
    const inboxSection = findInboxSectionBySlug('Snoozed');

    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });
});
