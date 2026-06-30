import { transformRawJsonField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-raw-json-field.util';

describe('transformRawJsonField', () => {
  it('should return null when value is null', () => {
    const result = transformRawJsonField(null);

    expect(result).toBeNull();
  });

  it('should return null when value is empty object', () => {
    const result = transformRawJsonField({});

    expect(result).toBeNull();
  });

  it('should return the string when value is empty array', () => {
    const result = transformRawJsonField([]);

    expect(result).toBeNull();
  });
});
