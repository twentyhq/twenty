import { describe, expect, it } from 'vitest';

import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';

describe('PdlInvalidInputError', () => {
  it('is a PdlError with a dedicated name, code, and the given message', () => {
    const error = new PdlInvalidInputError('recordId is required');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PdlError);
    expect(error.name).toBe('PdlInvalidInputError');
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.message).toBe('recordId is required');
  });
});
