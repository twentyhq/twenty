import { isInboxSectionActive } from '@/inbox/utils/isInboxSectionActive';

describe('isInboxSectionActive', () => {
  it('should be active on the section itself', () => {
    // Act & Assert
    expect(
      isInboxSectionActive({
        pathname: '/inbox/snoozed',
        inboxSectionPath: '/inbox/snoozed',
      }),
    ).toBe(true);
  });

  it('should stay active on an item inside the section', () => {
    // Act & Assert
    expect(
      isInboxSectionActive({
        pathname: '/inbox/snoozed/an-item-id',
        inboxSectionPath: '/inbox/snoozed',
      }),
    ).toBe(true);
  });

  it('should not be active for a section that merely shares a prefix', () => {
    // Act & Assert
    expect(
      isInboxSectionActive({
        pathname: '/inbox/snoozed-later',
        inboxSectionPath: '/inbox/snoozed',
      }),
    ).toBe(false);
  });

  it('should not be active for a different section', () => {
    // Act & Assert
    expect(
      isInboxSectionActive({
        pathname: '/inbox/done',
        inboxSectionPath: '/inbox/snoozed',
      }),
    ).toBe(false);
  });
});
