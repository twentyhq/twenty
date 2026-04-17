import { getPositionBoundsAtInsertionPoint } from '@/command-menu-item/edit/utils/getPositionBoundsAtInsertionPoint';

const makeItems = (positions: number[]) =>
  positions.map((position, index) => ({
    id: `item-${index}`,
    position,
  }));

describe('getPositionBoundsAtInsertionPoint', () => {
  const items = makeItems([10, 20, 30, 40, 50]);

  describe('insert before', () => {
    it('returns previous=undefined and next=10 when inserting before the first item', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-0', 'before', items),
      ).toEqual({
        previousPosition: undefined,
        nextPosition: 10,
      });
    });

    it('returns previous=10 and next=20 when inserting before the second item', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-1', 'before', items),
      ).toEqual({
        previousPosition: 10,
        nextPosition: 20,
      });
    });

    it('returns previous=40 and next=50 when inserting before the last item', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-4', 'before', items),
      ).toEqual({
        previousPosition: 40,
        nextPosition: 50,
      });
    });
  });

  describe('insert after', () => {
    it('returns previous=10 and next=20 when inserting after the first item', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-0', 'after', items),
      ).toEqual({
        previousPosition: 10,
        nextPosition: 20,
      });
    });

    it('returns previous=50 and next=undefined when inserting after the last item', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-4', 'after', items),
      ).toEqual({
        previousPosition: 50,
        nextPosition: undefined,
      });
    });

    it('returns previous=30 and next=40 when inserting after the middle item', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-2', 'after', items),
      ).toEqual({
        previousPosition: 30,
        nextPosition: 40,
      });
    });
  });

  describe('edge cases', () => {
    it('returns undefined when anchor item is not found', () => {
      expect(
        getPositionBoundsAtInsertionPoint('nonexistent', 'before', items),
      ).toBeUndefined();
    });

    it('handles single-item list inserting before', () => {
      const singleItem = makeItems([5]);

      expect(
        getPositionBoundsAtInsertionPoint('item-0', 'before', singleItem),
      ).toEqual({
        previousPosition: undefined,
        nextPosition: 5,
      });
    });

    it('handles single-item list inserting after', () => {
      const singleItem = makeItems([5]);

      expect(
        getPositionBoundsAtInsertionPoint('item-0', 'after', singleItem),
      ).toEqual({
        previousPosition: 5,
        nextPosition: undefined,
      });
    });

    it('returns undefined for empty list', () => {
      expect(
        getPositionBoundsAtInsertionPoint('item-0', 'before', []),
      ).toBeUndefined();
    });
  });
});
