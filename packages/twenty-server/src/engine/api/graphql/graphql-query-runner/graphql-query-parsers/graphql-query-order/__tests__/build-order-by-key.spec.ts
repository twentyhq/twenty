import { FieldMetadataType } from 'twenty-shared/types';

import { getOptionalOrderByCasting } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/get-optional-order-by-casting.util';

const shouldUseCaseInsensitiveOrder = (fieldMetadata: {
  type: FieldMetadataType;
}): boolean => {
  return (
    fieldMetadata.type === FieldMetadataType.TEXT ||
    fieldMetadata.type === FieldMetadataType.SELECT ||
    fieldMetadata.type === FieldMetadataType.MULTI_SELECT
  );
};

const buildOrderByKey = (
  prefix: string,
  columnName: string,
  fieldMetadata: { type: FieldMetadataType },
): string => {
  const casting = getOptionalOrderByCasting(fieldMetadata);
  const columnExpr = `${prefix}.${columnName}${casting}`;

  if (shouldUseCaseInsensitiveOrder(fieldMetadata)) {
    return `LOWER(${columnExpr})`;
  }

  return columnExpr;
};

describe('buildOrderByKey', () => {
  describe('case-insensitive sorting', () => {
    it('should wrap TEXT fields with LOWER()', () => {
      const result = buildOrderByKey('company', 'name', {
        type: FieldMetadataType.TEXT,
      });

      expect(result).toBe('LOWER(company.name)');
    });

    it('should wrap SELECT fields with LOWER() and ::text cast', () => {
      const result = buildOrderByKey('company', 'status', {
        type: FieldMetadataType.SELECT,
      });

      expect(result).toBe('LOWER(company.status::text)');
    });

    it('should wrap MULTI_SELECT fields with LOWER() and ::text cast', () => {
      const result = buildOrderByKey('company', 'tags', {
        type: FieldMetadataType.MULTI_SELECT,
      });

      expect(result).toBe('LOWER(company.tags::text)');
    });
  });

  describe('case-sensitive sorting', () => {
    it('should not wrap NUMBER fields with LOWER()', () => {
      const result = buildOrderByKey('company', 'employees', {
        type: FieldMetadataType.NUMBER,
      });

      expect(result).toBe('company.employees');
    });

    it('should not wrap DATE_TIME fields with LOWER()', () => {
      const result = buildOrderByKey('company', 'createdAt', {
        type: FieldMetadataType.DATE_TIME,
      });

      expect(result).toBe('company.createdAt');
    });

    it('should not wrap UUID fields with LOWER()', () => {
      const result = buildOrderByKey('company', 'id', {
        type: FieldMetadataType.UUID,
      });

      expect(result).toBe('company.id');
    });

    it('should not wrap BOOLEAN fields with LOWER()', () => {
      const result = buildOrderByKey('company', 'isActive', {
        type: FieldMetadataType.BOOLEAN,
      });

      expect(result).toBe('company.isActive');
    });
  });

  describe('with relation prefixes', () => {
    it('should use join alias as prefix for nested TEXT fields', () => {
      const result = buildOrderByKey('company', 'name', {
        type: FieldMetadataType.TEXT,
      });

      expect(result).toBe('LOWER(company.name)');
    });

    it('should use join alias as prefix for nested SELECT fields', () => {
      const result = buildOrderByKey('assignee', 'role', {
        type: FieldMetadataType.SELECT,
      });

      expect(result).toBe('LOWER(assignee.role::text)');
    });
  });
});

describe('getOptionalOrderByCasting', () => {
  it('should return ::text for SELECT fields', () => {
    const result = getOptionalOrderByCasting({
      type: FieldMetadataType.SELECT,
    });

    expect(result).toBe('::text');
  });

  it('should return ::text for MULTI_SELECT fields', () => {
    const result = getOptionalOrderByCasting({
      type: FieldMetadataType.MULTI_SELECT,
    });

    expect(result).toBe('::text');
  });

  it('should return empty string for TEXT fields', () => {
    const result = getOptionalOrderByCasting({
      type: FieldMetadataType.TEXT,
    });

    expect(result).toBe('');
  });

  it('should return empty string for NUMBER fields', () => {
    const result = getOptionalOrderByCasting({
      type: FieldMetadataType.NUMBER,
    });

    expect(result).toBe('');
  });
});
