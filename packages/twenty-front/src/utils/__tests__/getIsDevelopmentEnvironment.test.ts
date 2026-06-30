import { getIsDevelopmentEnvironment } from '~/utils/getIsDevelopmentEnvironment';

describe('getIsDevelopmentEnvironment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return true when IS_DEV_ENV is "true"', () => {
    process.env.IS_DEV_ENV = 'true';

    expect(getIsDevelopmentEnvironment()).toBe(true);
  });

  it('should return false when IS_DEV_ENV is "false"', () => {
    process.env.IS_DEV_ENV = 'false';

    expect(getIsDevelopmentEnvironment()).toBe(false);
  });

  it('should return false when IS_DEV_ENV is not set', () => {
    delete process.env.IS_DEV_ENV;

    expect(getIsDevelopmentEnvironment()).toBe(false);
  });
});
