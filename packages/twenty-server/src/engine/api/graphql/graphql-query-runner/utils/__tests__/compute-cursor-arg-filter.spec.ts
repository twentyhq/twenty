import { FieldMetadataType } from 'twenty-shared';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { GraphqlQueryRunnerException } from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { computeCursorArgFilter } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-cursor-arg-filter';

describe('computeCursorArgFilter', () => {
  const mockFieldMetadataMap = {
    name: {
      type: FieldMetadataType.TEXT,
      id: 'name-id',
      name: 'name',
      label: 'Name',
      objectMetadataId: 'object-id',
    },
    age: {
      type: FieldMetadataType.NUMBER,
      id: 'age-id',
      name: 'age',
      label: 'Age',
      objectMetadataId: 'object-id',
    },
    fullName: {
      type: FieldMetadataType.FULL_NAME,
      id: 'fullname-id',
      name: 'fullName',
      label: 'Full Name',
      objectMetadataId: 'object-id',
    },
  };

  describe('basic cursor filtering', () => {
    it('should return empty array when cursor is empty', () => {
      const result = computeCursorArgFilter({}, [], mockFieldMetadataMap, true);

      expect(result).toEqual([]);
    });

    it('should compute forward pagination filter for single field', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        mockFieldMetadataMap,
        true,
      );

      expect(result).toEqual([{ name: { gt: 'John' } }]);
    });

    it('should compute backward pagination filter for single field', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ name: OrderByDirection.AscNullsLast }];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        mockFieldMetadataMap,
        false,
      );

      expect(result).toEqual([{ name: { lt: 'John' } }]);
    });
  });

  describe('multiple fields cursor filtering', () => {
    it('should handle multiple cursor fields with forward pagination', () => {
      const cursor = { name: 'John', age: 30 };
      const orderBy = [
        { name: OrderByDirection.AscNullsLast },
        { age: OrderByDirection.DescNullsLast },
      ];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        mockFieldMetadataMap,
        true,
      );

      expect(result).toEqual([
        { name: { gt: 'John' } },
        { name: { eq: 'John' }, age: { lt: 30 } },
      ]);
    });
  });

  describe('composite field handling', () => {
    it('should handle fullName composite field', () => {
      const cursor = {
        fullName: { firstName: 'John', lastName: 'Doe' },
      };
      const orderBy = [
        {
          fullName: {
            firstName: OrderByDirection.AscNullsLast,
            lastName: OrderByDirection.AscNullsLast,
          },
        },
      ];

      const result = computeCursorArgFilter(
        cursor,
        orderBy,
        mockFieldMetadataMap,
        true,
      );

      expect(result).toEqual([
        {
          fullName: {
            firstName: { gt: 'John' },
            lastName: { gt: 'Doe' },
          },
        },
      ]);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid field metadata', () => {
      const cursor = { invalidField: 'value' };
      const orderBy = [{ invalidField: OrderByDirection.AscNullsLast }];

      expect(() =>
        computeCursorArgFilter(cursor, orderBy, mockFieldMetadataMap, true),
      ).toThrow(GraphqlQueryRunnerException);
    });

    it('should throw error for missing orderBy entry', () => {
      const cursor = { name: 'John' };
      const orderBy = [{ age: OrderByDirection.AscNullsLast }];

      expect(() =>
        computeCursorArgFilter(cursor, orderBy, mockFieldMetadataMap, true),
      ).toThrow(GraphqlQueryRunnerException);
    });
  });
});
