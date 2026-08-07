import { groupInboxItemsByDate } from '@/inbox/utils/groupInboxItemsByDate';
import { type InboxItem } from '~/generated/graphql';

const TODAY = new Date('2026-03-18T12:00:00.000Z');

const buildInboxItem = (id: string, updatedAt: string): InboxItem =>
  ({ id, updatedAt }) as InboxItem;

describe('groupInboxItemsByDate', () => {
  it('should return no group when there is no item', () => {
    expect(groupInboxItemsByDate([], TODAY)).toEqual([]);
  });

  it('should group an item updated today under Today', () => {
    const groups = groupInboxItemsByDate(
      [buildInboxItem('1', '2026-03-18T08:00:00.000Z')],
      TODAY,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('today');
    expect(groups[0].inboxItems.map((item) => item.id)).toEqual(['1']);
  });

  it('should group an item updated the previous calendar day under Yesterday', () => {
    const groups = groupInboxItemsByDate(
      [buildInboxItem('1', '2026-03-17T23:30:00.000Z')],
      TODAY,
    );

    expect(groups[0].id).toBe('yesterday');
  });

  it('should group items between two and seven days old under Previous 7 days', () => {
    const groups = groupInboxItemsByDate(
      [
        buildInboxItem('two-days', '2026-03-16T12:00:00.000Z'),
        buildInboxItem('seven-days', '2026-03-11T12:00:00.000Z'),
      ],
      TODAY,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('previous-7-days');
    expect(groups[0].inboxItems.map((item) => item.id)).toEqual([
      'two-days',
      'seven-days',
    ]);
  });

  it('should group an item older than seven days under its own month', () => {
    const groups = groupInboxItemsByDate(
      [buildInboxItem('1', '2026-03-01T12:00:00.000Z')],
      TODAY,
    );

    expect(groups[0].id).toBe('month:2026-3');
  });

  it('should keep items from different months in different groups', () => {
    const groups = groupInboxItemsByDate(
      [
        buildInboxItem('march', '2026-03-02T12:00:00.000Z'),
        buildInboxItem('february', '2026-02-20T12:00:00.000Z'),
      ],
      TODAY,
    );

    expect(groups.map((group) => group.id)).toEqual([
      'month:2026-3',
      'month:2026-2',
    ]);
  });

  it('should preserve the order in which groups first appear', () => {
    const groups = groupInboxItemsByDate(
      [
        buildInboxItem('today', '2026-03-18T09:00:00.000Z'),
        buildInboxItem('older', '2026-01-05T12:00:00.000Z'),
        buildInboxItem('yesterday', '2026-03-17T09:00:00.000Z'),
      ],
      TODAY,
    );

    expect(groups.map((group) => group.id)).toEqual([
      'today',
      'month:2026-1',
      'yesterday',
    ]);
  });

  it('should keep several items updated the same day in one group', () => {
    const groups = groupInboxItemsByDate(
      [
        buildInboxItem('first', '2026-03-18T09:00:00.000Z'),
        buildInboxItem('second', '2026-03-18T10:00:00.000Z'),
      ],
      TODAY,
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].inboxItems).toHaveLength(2);
  });
});
