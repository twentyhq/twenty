import { transformRawJsonField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-raw-json-field.util';

describe('transformRawJsonField', () => {
  it('should return null when value is null', () => {
    const result = transformRawJsonField(null, false);

    expect(result).toBeNull();
  });

  it('should return the empty object when value is empty object', () => {
    const result = transformRawJsonField({}, false);

    expect(result).toEqual({});
  });

  it('should return the empty array when value is empty array', () => {
    const result = transformRawJsonField([], false);

    expect(result).toEqual([]);
  });

  it('should return the object when value is non-empty object', () => {
    const jsonObject = { key: 'value', nested: { prop: 123 } };
    const result = transformRawJsonField(jsonObject, false);

    expect(result).toEqual(jsonObject);
  });

  it('should parse and return object when value is valid JSON string', () => {
    const jsonString = '{"key":"value","nested":{"prop":123}}';
    const result = transformRawJsonField(jsonString, false);

    expect(result).toEqual({ key: 'value', nested: { prop: 123 } });
  });
});
