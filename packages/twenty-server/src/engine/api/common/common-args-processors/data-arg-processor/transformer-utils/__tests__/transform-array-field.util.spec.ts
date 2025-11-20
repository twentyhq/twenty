import { transformArrayField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-array-field.util';

describe('transformArrayField', () => {
  it('should return null when value is null', () => {
    const result = transformArrayField(null, true);

    expect(result).toBeNull();
  });

  it('should return null when value is an empty array', () => {
    const result = transformArrayField([], true);

    expect(result).toBeNull();
  });

  it('should return an array when value is a string', () => {
    const result = transformArrayField('singleString', true);

    expect(result).toEqual(['singleString']);
  });

  it('should return an array when value is an array of strings', () => {
    const result = transformArrayField(['string1', 'string2', 'string3'], true);

    expect(result).toEqual(['string1', 'string2', 'string3']);
  });
});
