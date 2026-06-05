import { describe, expect, it } from 'vitest';

import { PdlConfigError } from 'src/logic-functions/utils/pdl-config-error';

describe('PdlConfigError', () => {
  it('is an Error with a dedicated name and the given message', () => {
    const error = new PdlConfigError('missing key');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('PdlConfigError');
    expect(error.message).toBe('missing key');
  });
});
