import { plainToClass } from 'class-transformer';

import { CastToPositiveNumber } from 'src/engine/core-modules/twenty-config/decorators/cast-to-positive-number.decorator';

class TestClass {
  @CastToPositiveNumber()
  numberProperty?: any;
}

describe('CastToPositiveNumber Decorator', () => {
  it('should cast number to number', () => {
    const transformedClass = plainToClass(TestClass, { numberProperty: 123 });

    expect(transformedClass.numberProperty).toBe(123);
  });

  it('should cast string to number', () => {
    const transformedClass = plainToClass(TestClass, { numberProperty: '123' });

    expect(transformedClass.numberProperty).toBe(123);
  });

  it('should cast null to undefined', () => {
    const transformedClass = plainToClass(TestClass, { numberProperty: null });

    expect(transformedClass.numberProperty).toBe(undefined);
  });

  it('should cast negative number to undefined', () => {
    const transformedClass = plainToClass(TestClass, { numberProperty: -12 });

    expect(transformedClass.numberProperty).toBe(undefined);
  });

  it('should cast undefined to undefined', () => {
    const transformedClass = plainToClass(TestClass, {
      numberProperty: undefined,
    });

    expect(transformedClass.numberProperty).toBe(undefined);
  });

  it('should cast NaN string to undefined', () => {
    const transformedClass = plainToClass(TestClass, {
      numberProperty: 'toto',
    });

    expect(transformedClass.numberProperty).toBe(undefined);
  });

  it('should cast a negative string to undefined', () => {
    const transformedClass = plainToClass(TestClass, {
      numberProperty: '-123',
    });

    expect(transformedClass.numberProperty).toBe(undefined);
  });
});
