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

  it('should cast "log,error,warn" to ["log", "error", "warn"]', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'log,error,warn',
    });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'error', 'warn']);
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

  it('should alias "info" to "log"', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'info' });

    expect(transformedClass.logLevels).toStrictEqual(['log']);
  });

  it('should handle the issue scenario "debug,info,error,warn"', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'debug,info,error,warn',
    });

    expect(transformedClass.logLevels).toStrictEqual([
      'debug',
      'log',
      'error',
      'warn',
    ]);
  });

  it('should filter out unknown levels and keep valid ones', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'verbose,error,toto',
    });

    expect(transformedClass.logLevels).toStrictEqual(['verbose', 'error']);
  });

  it('should resolve aliases and filter invalid levels together', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'info,debug,banana',
    });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'debug']);
  });

  it('should return default levels for completely invalid input', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 'toto' });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'error', 'warn']);
  });

  it('should return default levels for multiple invalid levels', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'banana,grape',
    });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'error', 'warn']);
  });

  it('should return default levels for numeric input', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: 12345 });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'error', 'warn']);
  });

  it('should return default levels for undefined input', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: undefined,
    });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'error', 'warn']);
  });

  it('should return default levels for null input', () => {
    const transformedClass = plainToClass(TestClass, { logLevels: null });

    expect(transformedClass.logLevels).toStrictEqual(['log', 'error', 'warn']);
  });

  it('should handle whitespace around levels', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: ' debug , info , error ',
    });

    expect(transformedClass.logLevels).toStrictEqual(['debug', 'log', 'error']);
  });

  it('should handle the complete set of valid levels', () => {
    const transformedClass = plainToClass(TestClass, {
      logLevels: 'log,error,warn,debug,verbose',
    });

    expect(transformedClass.logLevels).toStrictEqual([
      'log',
      'error',
      'warn',
      'debug',
      'verbose',
    ]);
  });
});
