import { FieldMetadataType } from 'twenty-shared/types';

import { parseNumberValue } from 'src/engine/api/common/common-args-processors/filter-arg-processor/utils/parse-number-value.util';

describe('parseNumberValue', () => {
  it('should return value unchanged when not a string', () => {
    expect(parseNumberValue(42, FieldMetadataType.NUMBER)).toBe(42);
  });

  it('should parse string to number for NUMBER field', () => {
    expect(parseNumberValue('42', FieldMetadataType.NUMBER)).toBe(42);
    expect(parseNumberValue('-3.14', FieldMetadataType.NUMERIC)).toBe(-3.14);
  });

  it('should parse string to number for POSITION field', () => {
    expect(parseNumberValue('1.5', FieldMetadataType.POSITION)).toBe(1.5);
  });

  it('should throw an error for unknown field type', () => {
    expect(parseNumberValue('not-a-number', FieldMetadataType.POSITION)).toBe(
      NaN,
    );
  });
});
