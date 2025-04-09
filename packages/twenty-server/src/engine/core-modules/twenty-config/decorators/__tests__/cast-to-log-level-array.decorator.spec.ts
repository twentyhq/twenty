import { plainToClass } from 'class-transformer';

import { CastToLogLevelArray } from 'src/engine/core-modules/twenty-config/decorators/cast-to-log-level-array.decorator';

class TestClass {
  @CastToLogLevelArray()
  logLevels?: any;
}

describe('CastToLogLevelArray Decorator', () => {
  it('should cast "log" to ["log"]', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'log' });

    expect(transformedClass.logLevels).toStrictEqual(['log']);
  });

  it('should cast "error" to ["error"]', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'error' });

    expect(transformedClass.logLevels).toStrictEqual(['error']);
  });

  it('should cast "warn" to ["warn"]', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'warn' });

    expect(transformedClass.logLevels).toStrictEqual(['warn']);
  });

  it('should cast "debug" to ["debug"]', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'debug' });

    expect(transformedClass.logLevels).toStrictEqual(['debug']);
  });

  it('should cast "verbose" to ["verbose"]', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'verbose' });

    expect(transformedClass.logLevels).toStrictEqual(['verbose']);
  });

  it('should cast "verbose,error,warn" to ["verbose", "error", "warn"]', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'verbose,error,warn',
    });

    expect(transformedClass.logLevels).toStrictEqual([
      'verbose',
      'error',
      'warn',
    ]);
  });

  it('should cast "toto" to undefined', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'toto' });

    expect(transformedClass.logLevels).toBeUndefined();
  });

  it('should cast "verbose,error,toto" to undefined', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'verbose,error,toto',
    });

    expect(transformedClass.logLevels).toBeUndefined();
  });
});
