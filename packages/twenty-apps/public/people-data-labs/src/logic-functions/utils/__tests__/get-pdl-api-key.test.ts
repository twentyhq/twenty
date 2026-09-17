import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';

describe('getPdlApiKey', () => {
  beforeEach(() => {
    vi.stubEnv('PDL_API_KEY', '  twenty-key  ');
    vi.stubEnv('PDL_CUSTOM_API_KEY', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([undefined, '', '   '])(
    'uses the Twenty-managed key when the custom key is %j',
    (customApiKey) => {
      vi.stubEnv('PDL_CUSTOM_API_KEY', customApiKey);

      expect(getPdlApiKey()).toBe('twenty-key');
    },
  );

  it.each([undefined, 'twenty-key'])(
    'prefers the custom key when the Twenty-managed key is %j',
    (managedApiKey) => {
      vi.stubEnv('PDL_API_KEY', managedApiKey);
      vi.stubEnv('PDL_CUSTOM_API_KEY', '  customer-key  ');

      expect(getPdlApiKey()).toBe('customer-key');
    },
  );

  it.each([undefined, '', '   '])(
    'throws a PdlConfigError when neither key is usable and the managed key is %j',
    (managedApiKey) => {
      vi.stubEnv('PDL_API_KEY', managedApiKey);

      expect(() => getPdlApiKey()).toThrow(PdlConfigError);
    },
  );
});
