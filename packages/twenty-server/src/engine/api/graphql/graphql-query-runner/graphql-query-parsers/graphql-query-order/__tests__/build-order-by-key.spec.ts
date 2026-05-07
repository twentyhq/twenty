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

  it('should return false for SELECT fields', () => {
    expect(shouldUseCaseInsensitiveOrder(FieldMetadataType.SELECT)).toBe(false);
  });

  it('should return false for MULTI_SELECT fields', () => {
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

describe('shouldCastToText', () => {
  it('should return false for SELECT fields', () => {
    expect(shouldCastToText(FieldMetadataType.SELECT)).toBe(false);
  });

  it('should return false for MULTI_SELECT fields', () => {
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

describe('getSelectOptionValuesSortedByPosition', () => {
  it('should return option values sorted by position', () => {
    const options = [
      { position: 2, value: 'MEDIUM' },
      { position: 0, value: 'URGENT' },
      { position: 3, value: 'LOW' },
      { position: 1, value: 'HIGH' },
    ];

    expect(getSelectOptionValuesSortedByPosition(options)).toEqual([
      'URGENT',
      'HIGH',
      'MEDIUM',
      'LOW',
    ]);
  });

  it('should not mutate the original array', () => {
    const options = [
      { position: 1, value: 'B' },
      { position: 0, value: 'A' },
    ];
    const original = [...options];

    getSelectOptionValuesSortedByPosition(options);
    expect(options).toEqual(original);
  });

  it('should handle a single option', () => {
    const options = [{ position: 0, value: 'ONLY' }];

    expect(getSelectOptionValuesSortedByPosition(options)).toEqual(['ONLY']);
  });
});
