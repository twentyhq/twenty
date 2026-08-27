import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

describe('getApplicationAccessToken', () => {
  const initialEnvironment = process.env;

  beforeEach(() => {
    process.env = { ...initialEnvironment };
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
  });

  afterEach(() => {
    process.env = initialEnvironment;
  });

  it('should prefer the application token over the delegated one', () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'delegated';

    expect(getApplicationAccessToken()).toBe('application');
  });

  it('should keep working in a run nobody triggered', () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application';

    expect(getApplicationAccessToken()).toBe('application');
  });

  it('should fall back to the delegated token for front components', () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = 'delegated';

    expect(getApplicationAccessToken()).toBe('delegated');
  });

  it('should return undefined outside the app runtime', () => {
    expect(getApplicationAccessToken()).toBeUndefined();
  });
});
