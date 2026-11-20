import { validate } from 'src/engine/core-modules/twenty-config/config-variables';

describe('validate', () => {
  it.each([
    ['error,warn', ['error', 'warn']],
    ['["error","warn"]', ['error', 'warn']],
  ])('should parse LOG_LEVELS=%s', (logLevels, expected) => {
    expect(validate({ LOG_LEVELS: logLevels }).LOG_LEVELS).toStrictEqual(
      expected,
    );
  });

  it('should keep the default LOG_LEVELS when empty', () => {
    expect(validate({ LOG_LEVELS: '' }).LOG_LEVELS).toBeUndefined();
  });

  it('should reject an invalid LOG_LEVELS value', () => {
    expect(() => validate({ LOG_LEVELS: 'error,info' })).toThrow(
      'Invalid log level(s): info',
    );
  });

  it('should parse METER_DRIVER', () => {
    expect(validate({ METER_DRIVER: 'console' }).METER_DRIVER).toStrictEqual([
      'console',
    ]);
  });

  it('should parse TYPEORM_LOGGING', () => {
    expect(
      validate({ TYPEORM_LOGGING: 'query,error' }).TYPEORM_LOGGING,
    ).toStrictEqual(['query', 'error']);
  });
});
