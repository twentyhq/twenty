import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildOrderByColumnExpression,
  shouldUseCaseInsensitiveOrder,
  wrapWithLowerIfNeeded,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';

describe('buildOrderByColumnExpression', () => {
  describe('case-insensitive sorting', () => {
    it('should wrap TEXT fields with LOWER()', () => {
      const result = buildOrderByColumnExpression('company', 'name', {
        type: FieldMetadataType.TEXT,
      });

      expect(result).toBe('LOWER(company.name)');
    });

    it('should wrap SELECT fields with LOWER() and ::text cast', () => {
      const result = buildOrderByColumnExpression('company', 'status', {
        type: FieldMetadataType.SELECT,
      });

      expect(result).toBe('LOWER(company.status::text)');
    });

    it('should wrap MULTI_SELECT fields with LOWER() and ::text cast', () => {
      const result = buildOrderByColumnExpression('company', 'tags', {
        type: FieldMetadataType.MULTI_SELECT,
      });

      expect(result).toBe('LOWER(company.tags::text)');
    });
  });

  describe('case-sensitive sorting', () => {
    it('should not wrap NUMBER fields with LOWER()', () => {
      const result = buildOrderByColumnExpression('company', 'employees', {
        type: FieldMetadataType.NUMBER,
      });

      expect(result).toBe('company.employees');
    });

    it('should not wrap DATE_TIME fields with LOWER()', () => {
      const result = buildOrderByColumnExpression('company', 'createdAt', {
        type: FieldMetadataType.DATE_TIME,
      });

      expect(result).toBe('company.createdAt');
    });

    it('should not wrap UUID fields with LOWER()', () => {
      const result = buildOrderByColumnExpression('company', 'id', {
        type: FieldMetadataType.UUID,
      });

      expect(result).toBe('company.id');
    });

    it('should not wrap BOOLEAN fields with LOWER()', () => {
      const result = buildOrderByColumnExpression('company', 'isActive', {
        type: FieldMetadataType.BOOLEAN,
      });

      expect(result).toBe('company.isActive');
    });
  });

  describe('with relation prefixes', () => {
    it('should use join alias as prefix for nested TEXT fields', () => {
      const result = buildOrderByColumnExpression('company', 'name', {
        type: FieldMetadataType.TEXT,
      });

      expect(result).toBe('LOWER(company.name)');
    });

    it('should use join alias as prefix for nested SELECT fields', () => {
      const result = buildOrderByColumnExpression('assignee', 'role', {
        type: FieldMetadataType.SELECT,
      });

      expect(result).toBe('LOWER(assignee.role::text)');
    });
  });
});

describe('shouldUseCaseInsensitiveOrder', () => {
  it('should return true for TEXT fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.TEXT)).toBe(true);
  });

  it('should return true for SELECT fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.SELECT)).toBe(true);
  });

  it('should return true for MULTI_SELECT fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.MULTI_SELECT)).toBe(
      true,
    );
  });

  it('should return false for NUMBER fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.NUMBER)).toBe(false);
  });

  it('should return false for DATE_TIME fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.DATE_TIME)).toBe(
      false,
    );
  });
});

describe('wrapWithLowerIfNeeded', () => {
  it('should wrap TEXT fields with LOWER()', () => {
    const result = wrapWithLowerIfNeeded(
      'company.name',
      FieldMetadataType.TEXT,
    );

    expect(result).toBe('LOWER(company.name)');
  });

  it('should wrap SELECT fields with LOWER()', () => {
    const result = wrapWithLowerIfNeeded(
      'company.status::text',
      FieldMetadataType.SELECT,
    );

    expect(result).toBe('LOWER(company.status::text)');
  });

  it('should not wrap NUMBER fields', () => {
    const result = wrapWithLowerIfNeeded(
      'company.count',
      FieldMetadataType.NUMBER,
    );

    expect(result).toBe('company.count');
  });
});
