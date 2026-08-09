import { getRenderedInboxItemOrder } from '@/inbox/utils/getRenderedInboxItemOrder';
import { type InboxItem, InboxItemPriority } from '~/generated/graphql';

const buildInboxItem = (id: string, priority: InboxItemPriority) =>
  ({ id, priority }) as InboxItem;

const needsActionItem = buildInboxItem(
  'needs-action',
  InboxItemPriority.NEEDS_ACTION,
);
const quietItem = buildInboxItem('newer-but-quiet', InboxItemPriority.UPDATE);
// The list is sorted by lastEventAt, so a quiet item can sort above a loud one
const inboxItems = [quietItem, needsActionItem];

describe('getRenderedInboxItemOrder', () => {
  it('should put needs-action items first when the list splits by priority', () => {
    // Act
    const order = getRenderedInboxItemOrder({
      inboxItems,
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
      inboxItems: [quietItem],
      shouldSplitByPriority: true,
    });

    // Assert
    expect(order).toHaveLength(1);
  });
});
