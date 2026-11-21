import { Logger } from '@nestjs/common';

import { validate } from 'src/engine/core-modules/twenty-config/config-variables';

describe('validate', () => {
  beforeEach(() => {
    jest.spyOn(Logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ['error,warn', ['error', 'warn']],
    ['["error","warn"]', ['error', 'warn']],
  ])('should parse LOG_LEVELS=%s', (logLevels, expected) => {
    expect(validate({ LOG_LEVELS: logLevels }).LOG_LEVELS).toStrictEqual(
      expected,
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

  it.each([
    ['LOG_LEVELS', 'error,info'],
    ['METER_DRIVER', 'Console'],
    ['TYPEORM_LOGGING', 'verbose'],
  ])('should reject an invalid %s value', (key, value) => {
    expect(() => validate({ [key]: value })).toThrow(
      'Config variables validation failed',
    );
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining(`each value in ${key} must be one of`),
    );
  });
});
