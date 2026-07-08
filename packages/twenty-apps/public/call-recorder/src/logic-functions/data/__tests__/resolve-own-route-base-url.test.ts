import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveOwnRouteBaseUrl } from 'src/logic-functions/data/resolve-own-route-base-url.util';

describe('resolveOwnRouteBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the injected functions url', () => {
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');

    expect(resolveOwnRouteBaseUrl()).toBe('https://acme.functions.example.com');
  });

  it('fails clearly when the functions url is not injected', () => {
    vi.stubEnv('TWENTY_FUNCTIONS_URL', '');

    expect(() => resolveOwnRouteBaseUrl()).toThrow(
      'Unable to resolve Call Recorder own route target without TWENTY_FUNCTIONS_URL',
    );
  });
});
