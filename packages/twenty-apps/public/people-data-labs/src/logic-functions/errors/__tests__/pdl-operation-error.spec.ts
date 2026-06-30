import { describe, expect, it } from 'vitest';

import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlOperationError } from 'src/logic-functions/errors/pdl-operation-error';

describe('PdlOperationError', () => {
  it('is a PdlError with a dedicated name, code, and the given message', () => {
    const error = new PdlOperationError('no id returned');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PdlError);
    expect(error.name).toBe('PdlOperationError');
    expect(error.code).toBe('OPERATION_FAILED');
    expect(error.message).toBe('no id returned');
  });
});
