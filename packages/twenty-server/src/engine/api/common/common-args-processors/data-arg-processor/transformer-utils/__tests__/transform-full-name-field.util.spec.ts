import { transformFullNameField } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-full-name-field.util';

describe('transformFullNameField', () => {
  it('should return null when value is null', () => {
    const result = transformFullNameField(null);

    expect(result).toBeNull();
  });

  it('should return full name object with both fields', () => {
    const value = {
      firstName: 'John',
      lastName: 'Doe',
    };
    const result = transformFullNameField(value);

    expect(result).toEqual({
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should return full name object with only lastName', () => {
    const value = {
      lastName: '',
    };
    const result = transformFullNameField(value);

    expect(result).toEqual({
      lastName: null,
    });
  });
});
