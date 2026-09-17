import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCustomPdlApiKey } from 'src/logic-functions/utils/get-custom-pdl-api-key';

describe('getCustomPdlApiKey', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('trims the custom key', () => {
    vi.stubEnv('PDL_CUSTOM_API_KEY', '  customer-key  ');

    expect(getCustomPdlApiKey()).toBe('customer-key');
  });

  it.each([undefined, '', '   '])(
    'treats %j as an unconfigured custom key',
    (customApiKey) => {
      vi.stubEnv('PDL_CUSTOM_API_KEY', customApiKey);

      expect(getCustomPdlApiKey()).toBeUndefined();
    },
  );
});
