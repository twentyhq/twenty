import { INBOX_SECTIONS } from '@/inbox/constants/InboxSections';
import { findInboxSectionBySlug } from '@/inbox/utils/findInboxSectionBySlug';
import { getInboxSectionPath } from '@/inbox/utils/getInboxSectionPath';

describe('getInboxSectionPath', () => {
  it('should build the path from the section slug', () => {
    const path = getInboxSectionPath(findInboxSectionBySlug('done'));

    expect(path).toBe('/inbox/done');
  });

  it('should round trip every declared section back to itself', () => {
    INBOX_SECTIONS.forEach((inboxSection) => {
      const slug = getInboxSectionPath(inboxSection).replace('/inbox/', '');

      expect(findInboxSectionBySlug(slug)).toBe(inboxSection);
    });
  });
});
