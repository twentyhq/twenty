import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  getApplicationAccessToken,
  getCallerAccessToken,
} from '@/sdk/utils/get-application-access-token';

const initialEnvironment = process.env;

beforeEach(() => {
  process.env = {
    ...initialEnvironment,
    TWENTY_APP_ACCESS_TOKEN: undefined,
    TWENTY_APP_APPLICATION_ACCESS_TOKEN: undefined,
  };
});

afterEach(() => {
  process.env = initialEnvironment;
});

describe('getApplicationAccessToken', () => {
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

describe('getCallerAccessToken', () => {
  it('should prefer the delegated token over the application one', () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'delegated';

    expect(getCallerAccessToken()).toBe('delegated');
  });

  it('should fall back to the application token in a run nobody triggered', () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application';

    expect(getCallerAccessToken()).toBe('application');
  });

  it('should return undefined outside the app runtime', () => {
    expect(getCallerAccessToken()).toBeUndefined();
  });
});
