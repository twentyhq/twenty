import { FieldMetadataType } from 'twenty-shared/types';

import {
  buildOrderByColumnExpression,
  getSelectOptionValuesSortedByPosition,
  isSelectFieldType,
  shouldCastToText,
  shouldUseCaseInsensitiveOrder,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';

describe('buildOrderByColumnExpression', () => {
  describe('returns unquoted column expressions for TypeORM', () => {
    it('should return unquoted alias.column format', () => {
      const result = buildOrderByColumnExpression('company', 'name');

      expect(result).toBe('company.name');
    });

    it('should work with different prefixes', () => {
      const result = buildOrderByColumnExpression('assignee', 'email');

      expect(result).toBe('assignee.email');
    });

    it('should handle composite column names (e.g., nameFirstName)', () => {
      const result = buildOrderByColumnExpression('person', 'nameFirstName');

      expect(result).toBe('person.nameFirstName');
    });
  });
});

describe('shouldUseCaseInsensitiveOrder', () => {
  it('should return true for TEXT fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.TEXT)).toBe(true);
  });

  it('should return false for SELECT fields (uses ARRAY_POSITION instead)', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.SELECT)).toBe(false);
  });

  it('should return false for MULTI_SELECT fields (uses ARRAY_POSITION instead)', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.MULTI_SELECT)).toBe(
      false,
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

describe('isSelectFieldType', () => {
  it('should return true for SELECT fields', () => {
    expect(isSelectFieldType(FieldMetadataType.SELECT)).toBe(true);
  });

  it('should return true for MULTI_SELECT fields', () => {
    expect(isSelectFieldType(FieldMetadataType.MULTI_SELECT)).toBe(true);
  });

  it('should return false for TEXT fields', () => {
    expect(isSelectFieldType(FieldMetadataType.TEXT)).toBe(false);
  });

  it('should return false for NUMBER fields', () => {
    expect(isSelectFieldType(FieldMetadataType.NUMBER)).toBe(false);
  });
});

describe('shouldCastToText', () => {
  it('should return false for SELECT fields (uses ARRAY_POSITION instead)', () => {
    expect(shouldCastToText(FieldMetadataType.SELECT)).toBe(false);
  });

  it('should return false for MULTI_SELECT fields (uses ARRAY_POSITION instead)', () => {
    expect(shouldCastToText(FieldMetadataType.MULTI_SELECT)).toBe(false);
  });

  it('should return false for TEXT fields', () => {
    expect(shouldCastToText(FieldMetadataType.TEXT)).toBe(false);
  });

  it('should return false for NUMBER fields', () => {
    expect(shouldCastToText(FieldMetadataType.NUMBER)).toBe(false);
  });

  it('should return false for DATE_TIME fields', () => {
    expect(shouldCastToText(FieldMetadataType.DATE_TIME)).toBe(false);
  });
});

describe('getSelectOptionValuesSortedByPosition', () => {
  it('should return undefined for null options', () => {
    expect(getSelectOptionValuesSortedByPosition(null)).toBeUndefined();
  });

  it('should return undefined for undefined options', () => {
    expect(getSelectOptionValuesSortedByPosition(undefined)).toBeUndefined();
  });

  it('should return undefined for empty options array', () => {
    expect(getSelectOptionValuesSortedByPosition([])).toBeUndefined();
  });

  it('should return option values sorted by position', () => {
    const options = [
      { value: 'MEDIUM', label: 'Medium', position: 2, color: 'yellow' as const },
      { value: 'URGENT', label: 'Urgent', position: 0, color: 'red' as const },
      { value: 'HIGH', label: 'High', position: 1, color: 'orange' as const },
      { value: 'LOW', label: 'Low', position: 3, color: 'green' as const },
    ];

    const result = getSelectOptionValuesSortedByPosition(options);

    expect(result).toEqual(['URGENT', 'HIGH', 'MEDIUM', 'LOW']);
  });

  it('should handle options with same position', () => {
    const options = [
      { value: 'B', label: 'B', position: 1, color: 'blue' as const },
      { value: 'A', label: 'A', position: 1, color: 'green' as const },
    ];

    const result = getSelectOptionValuesSortedByPosition(options);

    expect(result).toHaveLength(2);
    expect(result).toContain('A');
    expect(result).toContain('B');
  });
});
