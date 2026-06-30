import { transformTextField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-text-field.util';

describe('transformTextField', () => {
  it('should return null when value is null', () => {
    const result = transformTextField(null);

    expect(result).toBeNull();
  });

  it('should return null when value is empty string', () => {
    const result = transformTextField('');

    expect(result).toBeNull();
  });

  it('should return the string when value is a non-empty string', () => {
    const result = transformTextField('hello world');

    expect(result).toBe('hello world');
  });
});
