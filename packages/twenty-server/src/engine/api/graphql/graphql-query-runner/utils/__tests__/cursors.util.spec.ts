import { OrderByDirection } from 'twenty-shared/types';

import {
  decodeCursor,
  encodeCursor,
} from 'src/engine/api/graphql/graphql-query-runner/utils/cursors.util';

describe('cursors util', () => {
  describe('encodeCursor', () => {
    it('should encode scalar order by values', () => {
      const cursor = encodeCursor(
        {
          id: 'record-id',
          name: 'Workflow A',
          createdAt: '2026-05-26T00:00:00.000Z',
        } as any,
        [
          { name: OrderByDirection.AscNullsLast },
          { createdAt: OrderByDirection.AscNullsLast },
        ],
      );

      expect(decodeCursor(cursor)).toEqual({
        name: 'Workflow A',
        createdAt: '2026-05-26T00:00:00.000Z',
        id: 'record-id',
      });
    });

    it('should encode nested order by leaf values with dotted keys', () => {
      const cursor = encodeCursor(
        {
          id: 'record-id',
          name: {
            firstName: 'Ada',
            lastName: 'Lovelace',
          },
        } as any,
        [{ name: { firstName: OrderByDirection.AscNullsLast } }],
      );

      expect(decodeCursor(cursor)).toEqual({
        'name.firstName': 'Ada',
        id: 'record-id',
      });
    });

    it('should preserve multiple nested order by leaf values for the same field', () => {
      const cursor = encodeCursor(
        {
          id: 'record-id',
          name: {
            firstName: 'Ada',
            lastName: 'Lovelace',
          },
        } as any,
        [
          { name: { firstName: OrderByDirection.AscNullsLast } },
          { name: { lastName: OrderByDirection.AscNullsLast } },
        ],
      );

      expect(decodeCursor(cursor)).toEqual({
        'name.firstName': 'Ada',
        'name.lastName': 'Lovelace',
        id: 'record-id',
      });
    });

    it('should encode null nested leaf values', () => {
      const cursor = encodeCursor(
        {
          id: 'record-id',
          name: {
            firstName: null,
          },
        } as any,
        [{ name: { firstName: OrderByDirection.AscNullsLast } }],
      );

      expect(decodeCursor(cursor)).toEqual({
        'name.firstName': null,
        id: 'record-id',
      });
    });

    it('should encode id when no order is provided', () => {
      const cursor = encodeCursor(
        {
          id: 'record-id',
        } as any,
        undefined,
      );

      expect(decodeCursor(cursor)).toEqual({
        id: 'record-id',
      });
    });
  });
});
