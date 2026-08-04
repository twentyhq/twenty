import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getPdlApiKey } from 'src/logic-functions/utils/get-pdl-api-key';
import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';

describe('getPdlApiKey', () => {
  let previousApiKey: string | undefined;

  beforeEach(() => {
    previousApiKey = process.env.PEOPLE_DATA_LABS_APP_API_KEY;
  });

  afterEach(() => {
    if (previousApiKey === undefined) {
      delete process.env.PEOPLE_DATA_LABS_APP_API_KEY;
    } else {
      process.env.PEOPLE_DATA_LABS_APP_API_KEY = previousApiKey;
    }
  });

  it('returns the configured key', () => {
    process.env.PEOPLE_DATA_LABS_APP_API_KEY = 'secret-key';

    expect(getPdlApiKey()).toBe('secret-key');
  });

  it('throws a PdlConfigError when the key is missing', () => {
    delete process.env.PEOPLE_DATA_LABS_APP_API_KEY;

    expect(() => getPdlApiKey()).toThrow(PdlConfigError);
  });

  it('throws a PdlConfigError when the key is blank', () => {
    process.env.PEOPLE_DATA_LABS_APP_API_KEY = '   ';

    expect(() => getPdlApiKey()).toThrow(PdlConfigError);
  });
});
