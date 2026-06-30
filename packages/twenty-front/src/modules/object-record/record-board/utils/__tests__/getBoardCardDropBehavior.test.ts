import { getBoardCardDropBehavior } from '@/object-record/record-board/utils/getBoardCardDropBehavior';

describe('getBoardCardDropBehavior', () => {
  it('should block same-column drops when record sorting is active', () => {
    expect(
      getBoardCardDropBehavior({
        hasRecordSorts: true,
        sourceDroppableId: 'new',
        destinationDroppableId: 'new',
      }),
    ).toEqual({
      shouldBlockDrop: true,
      shouldUpdatePosition: false,
    });
  });

  it('should allow cross-column drops without position updates when record sorting is active', () => {
    expect(
      getBoardCardDropBehavior({
        hasRecordSorts: true,
        sourceDroppableId: 'new',
        destinationDroppableId: 'won',
      }),
    ).toEqual({
      shouldBlockDrop: false,
      shouldUpdatePosition: false,
    });
  });

  it('should allow drops with position updates when record sorting is inactive', () => {
    expect(
      getBoardCardDropBehavior({
        hasRecordSorts: false,
        sourceDroppableId: 'new',
        destinationDroppableId: 'won',
      }),
    ).toEqual({
      shouldBlockDrop: false,
      shouldUpdatePosition: true,
    });
  });
});
