import { FieldMetadataType } from 'twenty-shared/types';

import { buildOrderByColumnExpression } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';

describe('buildOrderByColumnExpression', () => {
  describe('case-insensitive sorting with LOWER()', () => {
    it('should wrap TEXT fields with LOWER()', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'name',
        FieldMetadataType.TEXT,
      );

      expect(result).toBe('LOWER(company.name)');
    });

    it('should wrap SELECT fields with LOWER() and ::text cast', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'status',
        FieldMetadataType.SELECT,
      );

      expect(result).toBe('LOWER(company.status::text)');
    });

    it('should wrap MULTI_SELECT fields with LOWER() and ::text cast', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'tags',
        FieldMetadataType.MULTI_SELECT,
      );

      expect(result).toBe('LOWER(company.tags::text)');
    });
  });

  describe('case-sensitive sorting (no LOWER)', () => {
    it('should not wrap NUMBER fields with LOWER()', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'employees',
        FieldMetadataType.NUMBER,
      );

      expect(result).toBe('company.employees');
    });

    it('should not wrap DATE_TIME fields with LOWER()', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'createdAt',
        FieldMetadataType.DATE_TIME,
      );

      expect(result).toBe('company.createdAt');
    });

    it('should not wrap UUID fields with LOWER()', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'id',
        FieldMetadataType.UUID,
      );

      expect(result).toBe('company.id');
    });

    it('should not wrap BOOLEAN fields with LOWER()', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'isActive',
        FieldMetadataType.BOOLEAN,
      );

      expect(result).toBe('company.isActive');
    });
  });

  describe('with relation join aliases', () => {
    it('should use join alias as prefix for nested TEXT fields', () => {
      const result = buildOrderByColumnExpression(
        'assignee',
        'name',
        FieldMetadataType.TEXT,
      );

      expect(result).toBe('LOWER(assignee.name)');
    });

    it('should use join alias as prefix for nested SELECT fields', () => {
      const result = buildOrderByColumnExpression(
        'assignee',
        'role',
        FieldMetadataType.SELECT,
      );

      expect(result).toBe('LOWER(assignee.role::text)');
    });
  });

  describe('composite field column names', () => {
    it('should handle composite column names (e.g., nameFirstName)', () => {
      const result = buildOrderByColumnExpression(
        'person',
        'nameFirstName',
        FieldMetadataType.TEXT,
      );

      expect(result).toBe('LOWER(person.nameFirstName)');
    });
  });
});
