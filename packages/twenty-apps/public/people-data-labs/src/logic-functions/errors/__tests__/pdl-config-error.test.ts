import { describe, expect, it } from 'vitest';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlError } from 'src/logic-functions/errors/pdl-error';

describe('PdlConfigError', () => {
  it('is a PdlError with a dedicated name, code, and the given message', () => {
    const error = new PdlConfigError('missing key');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PdlError);
    expect(error.name).toBe('PdlConfigError');
    expect(error.code).toBe('CONFIGURATION');
    expect(error.message).toBe('missing key');
  });
});
