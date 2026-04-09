import { transformNumericField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-numeric-field.util';

describe('transformNumericField', () => {
  it('should return null when value is null', () => {
    const result = transformNumericField(null);

    expect(result).toBeNull();
  });

  it('should return the number when value is a float', () => {
    const result = transformNumericField(3.14159);

    expect(result).toBe(3.14159);
  });

  it('should transform a numeric string with decimals to a number', () => {
    const result = transformNumericField('123.456');

    expect(result).toBe(123.456);
  });
});
