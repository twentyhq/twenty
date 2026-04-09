import { OrderByDirection } from 'twenty-shared/types';

import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { mapOrderByToDirection } from 'src/modules/dashboard/chart-data/utils/map-order-by-to-direction.util';

describe('mapOrderByToDirection', () => {
  describe('FIELD_ASC', () => {
    it('should return AscNullsLast', () => {
      const result = mapOrderByToDirection(GraphOrderBy.FIELD_ASC);

      expect(result).toBe(OrderByDirection.AscNullsLast);
    });
  });

  describe('FIELD_DESC', () => {
    it('should return DescNullsLast', () => {
      const result = mapOrderByToDirection(GraphOrderBy.FIELD_DESC);

      expect(result).toBe(OrderByDirection.DescNullsLast);
    });
  });

  describe('VALUE_ASC', () => {
    it('should return AscNullsLast', () => {
      const result = mapOrderByToDirection(GraphOrderBy.VALUE_ASC);

      expect(result).toBe(OrderByDirection.AscNullsLast);
    });
  });

  describe('VALUE_DESC', () => {
    it('should return DescNullsLast', () => {
      const result = mapOrderByToDirection(GraphOrderBy.VALUE_DESC);

      expect(result).toBe(OrderByDirection.DescNullsLast);
    });
  });

  describe('consistency', () => {
    it('should map all ASC orders to AscNullsLast', () => {
      expect(mapOrderByToDirection(GraphOrderBy.FIELD_ASC)).toBe(
        OrderByDirection.AscNullsLast,
      );
      expect(mapOrderByToDirection(GraphOrderBy.VALUE_ASC)).toBe(
        OrderByDirection.AscNullsLast,
      );
    });

    it('should map all DESC orders to DescNullsLast', () => {
      expect(mapOrderByToDirection(GraphOrderBy.FIELD_DESC)).toBe(
        OrderByDirection.DescNullsLast,
      );
      expect(mapOrderByToDirection(GraphOrderBy.VALUE_DESC)).toBe(
        OrderByDirection.DescNullsLast,
      );
    });
  });
});
