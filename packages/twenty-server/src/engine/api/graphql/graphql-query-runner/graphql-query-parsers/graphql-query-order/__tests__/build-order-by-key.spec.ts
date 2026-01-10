import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildOrderByColumnExpression,
  shouldUseCaseInsensitiveOrder,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';

describe('buildOrderByColumnExpression', () => {
  describe('column expression with quoted identifiers', () => {
    it('should quote TEXT field identifiers', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'name',
        FieldMetadataType.TEXT,
      );

      expect(result).toBe('"company"."name"');
    });

    it('should quote and cast SELECT fields to ::text', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'status',
        FieldMetadataType.SELECT,
      );

      expect(result).toBe('"company"."status"::text');
    });

    it('should quote and cast MULTI_SELECT fields to ::text', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'tags',
        FieldMetadataType.MULTI_SELECT,
      );

      expect(result).toBe('"company"."tags"::text');
    });

    it('should quote NUMBER fields without cast', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'employees',
        FieldMetadataType.NUMBER,
      );

      expect(result).toBe('"company"."employees"');
    });

    it('should quote DATE_TIME fields without cast', () => {
      const result = buildOrderByColumnExpression(
        'company',
        'createdAt',
        FieldMetadataType.DATE_TIME,
      );

      expect(result).toBe('"company"."createdAt"');
    });
  });

  describe('with relation join aliases', () => {
    it('should use join alias as prefix for nested fields', () => {
      const result = buildOrderByColumnExpression(
        'assignee',
        'name',
        FieldMetadataType.TEXT,
      );

      expect(result).toBe('"assignee"."name"');
    });
  });

  describe('composite field column names', () => {
    it('should handle composite column names (e.g., nameFirstName)', () => {
      const result = buildOrderByColumnExpression(
        'person',
        'nameFirstName',
        FieldMetadataType.TEXT,
      );

      expect(result).toBe('"person"."nameFirstName"');
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

  it('should return false for UUID fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.UUID)).toBe(false);
  });

  it('should return false for BOOLEAN fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.BOOLEAN)).toBe(
      false,
    );
  });
});
