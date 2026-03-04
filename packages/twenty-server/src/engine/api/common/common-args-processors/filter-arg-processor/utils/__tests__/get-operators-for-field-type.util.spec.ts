import { FieldMetadataType } from 'twenty-shared/types';

import { getOperatorsForFieldType } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/get-operators-for-field-type.util';

describe('getOperatorsForFieldType', () => {
  it('should return STRING_FILTER_OPERATORS for TEXT', () => {
    const result = getOperatorsForFieldType(FieldMetadataType.TEXT);

    expect(result).toContain('eq');
    expect(result).toContain('like');
    expect(result).toContain('startsWith');
  });

  it('should return NUMBER_FILTER_OPERATORS for NUMBER', () => {
    const result = getOperatorsForFieldType(FieldMetadataType.NUMBER);

    expect(result).toContain('eq');
    expect(result).toContain('gt');
    expect(result).toContain('in');
  });

  it('should return BOOLEAN_FILTER_OPERATORS for BOOLEAN', () => {
    const result = getOperatorsForFieldType(FieldMetadataType.BOOLEAN);

    expect(result).toEqual(['eq', 'is']);
  });

  it('should return ARRAY_FILTER_OPERATORS for ARRAY', () => {
    const result = getOperatorsForFieldType(FieldMetadataType.ARRAY);

    expect(result).toContain('containsIlike');
    expect(result).toContain('isEmptyArray');
  });
});
