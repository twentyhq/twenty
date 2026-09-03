import { DEFAULT_INBOX_SECTION } from '@/inbox/constants/DefaultInboxSection';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { InboxItemScope } from '~/generated/graphql';

describe('findInboxSectionBySlug', () => {
  it('should return the matching section when the slug is known', () => {
    // Act
    const inboxSection = findInboxSectionBySlug('snoozed');

    // Assert
    expect(inboxSection.scope).toBe(InboxItemScope.SNOOZED);
  });

  it('should fall back to the default section when the slug is unknown', () => {
    // Act
    const inboxSection = findInboxSectionBySlug('nope');

    // Assert
    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });

  it('should fall back to the default section when no slug is given', () => {
    // Act
    const inboxSection = findInboxSectionBySlug();

    // Assert
    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });

  it('should fall back to the default section when the slug is empty', () => {
    // Act
    const inboxSection = findInboxSectionBySlug('');

    // Assert
    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });

  it('should not match a slug that differs only by case', () => {
    // Act
    const inboxSection = findInboxSectionBySlug('Snoozed');

    // Assert
    expect(inboxSection).toBe(DEFAULT_INBOX_SECTION);
  });
});
