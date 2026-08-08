import { getRenderedInboxItemOrder } from '@/inbox/utils/getRenderedInboxItemOrder';
import { type InboxItem } from '~/generated/graphql';

const buildInboxItem = (id: string) => ({ id }) as InboxItem;

const needsActionItems = [buildInboxItem('needs-action')];
const otherItems = [buildInboxItem('newer-but-quiet')];
// The list is sorted by updatedAt, so a quiet item can sort above a loud one
const inboxItems = [...otherItems, ...needsActionItems];

describe('getRenderedInboxItemOrder', () => {
  it('should put needs-action items first when the list splits by priority', () => {
    // Act
    const order = getRenderedInboxItemOrder({
      inboxItems,
      needsActionItems,
      otherItems,
      shouldSplitByPriority: true,
    });

    // Assert
    expect(order.map((inboxItem) => inboxItem.id)).toEqual([
      'needs-action',
      'newer-but-quiet',
    ]);
  });

  it('should keep the plain sort when the list does not split', () => {
    // Act
    const order = getRenderedInboxItemOrder({
      inboxItems,
      needsActionItems,
      otherItems,
      shouldSplitByPriority: false,
    });

    // Assert
    expect(order.map((inboxItem) => inboxItem.id)).toEqual([
      'newer-but-quiet',
      'needs-action',
    ]);
  });

  it('should cover every rendered item when splitting with nothing urgent', () => {
    // Act
    const order = getRenderedInboxItemOrder({
      inboxItems: otherItems,
      needsActionItems: [],
      otherItems,
      shouldSplitByPriority: true,
    });

    // Assert
    expect(order).toHaveLength(otherItems.length);
  });
});
