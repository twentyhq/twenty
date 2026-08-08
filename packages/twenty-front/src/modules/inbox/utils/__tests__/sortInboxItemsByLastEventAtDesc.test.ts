import { sortInboxItemsByLastEventAtDesc } from '@/inbox/utils/sortInboxItemsByLastEventAtDesc';
import { type InboxItem } from '~/generated/graphql';

const buildInboxItem = (id: string, lastEventAt: string) =>
  ({ id, lastEventAt }) as InboxItem;

describe('sortInboxItemsByLastEventAtDesc', () => {
  it('should put the most recently updated item first', () => {
    // Arrange
    const inboxItems = [
      buildInboxItem('older', '2026-08-01T10:00:00.000Z'),
      buildInboxItem('newer', '2026-08-07T10:00:00.000Z'),
      buildInboxItem('middle', '2026-08-04T10:00:00.000Z'),
    ];

    // Act
    const sorted = sortInboxItemsByLastEventAtDesc(inboxItems);

    // Assert
    expect(sorted.map((inboxItem) => inboxItem.id)).toEqual([
      'newer',
      'middle',
      'older',
    ]);
  });

  it('should not mutate the array it was given', () => {
    // Arrange
    const inboxItems = [
      buildInboxItem('older', '2026-08-01T10:00:00.000Z'),
      buildInboxItem('newer', '2026-08-07T10:00:00.000Z'),
    ];

    // Act
    sortInboxItemsByLastEventAtDesc(inboxItems);

    // Assert
    expect(inboxItems.map((inboxItem) => inboxItem.id)).toEqual([
      'older',
      'newer',
    ]);
  });

  it('should keep the original order of items updated at the same time', () => {
    // Arrange
    const inboxItems = [
      buildInboxItem('first', '2026-08-07T10:00:00.000Z'),
      buildInboxItem('second', '2026-08-07T10:00:00.000Z'),
    ];

    // Act
    const sorted = sortInboxItemsByLastEventAtDesc(inboxItems);

    // Assert
    expect(sorted.map((inboxItem) => inboxItem.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('should return an empty array unchanged', () => {
    // Act & Assert
    expect(sortInboxItemsByLastEventAtDesc([])).toEqual([]);
  });
});
