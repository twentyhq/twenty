import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';

describe('getPdlApiKey', () => {
  beforeEach(() => {
    vi.stubEnv('PDL_API_KEY', '  default-key  ');
    vi.stubEnv('PDL_CUSTOM_API_KEY', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([undefined, '', '   '])(
    'uses the default key when the custom key is %j',
    (customApiKey) => {
      vi.stubEnv('PDL_CUSTOM_API_KEY', customApiKey);

      expect(getPdlApiKey()).toBe('default-key');
    },
  );

  it.each([undefined, 'default-key'])(
    'prefers the custom key when the default key is %j',
    (defaultApiKey) => {
      vi.stubEnv('PDL_API_KEY', defaultApiKey);
      vi.stubEnv('PDL_CUSTOM_API_KEY', '  customer-key  ');

      expect(getPdlApiKey()).toBe('customer-key');
    },
  );

  it.each([undefined, '', '   '])(
    'throws a PdlConfigError when neither key is usable and the default key is %j',
    (defaultApiKey) => {
      vi.stubEnv('PDL_API_KEY', defaultApiKey);
      vi.stubEnv('PDL_CUSTOM_API_KEY', '');

      expect(() => getPdlApiKey()).toThrow(PdlConfigError);
    },
  );

  it.each(['customer\nkey', 'customer-key​'])(
    'throws a PdlConfigError without revealing the custom key %j',
    (customApiKey) => {
      vi.stubEnv('PDL_CUSTOM_API_KEY', customApiKey);

      expect(() => getPdlApiKey()).toThrow(PdlConfigError);
      expect(() => getPdlApiKey()).not.toThrow(/customer/);
    },
  );
});
