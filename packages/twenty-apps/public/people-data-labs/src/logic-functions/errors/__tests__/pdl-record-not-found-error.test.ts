import { describe, expect, it } from 'vitest';

import { PdlError } from 'src/logic-functions/errors/pdl-error';
import { PdlRecordNotFoundError } from 'src/logic-functions/errors/pdl-record-not-found-error';

describe('PdlRecordNotFoundError', () => {
  it('exposes the object type and record id alongside a built message', () => {
    const error = new PdlRecordNotFoundError({
      objectNameSingular: 'Person',
      recordId: 'p1',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PdlError);
    expect(error.name).toBe('PdlRecordNotFoundError');
    expect(error.code).toBe('RECORD_NOT_FOUND');
    expect(error.objectNameSingular).toBe('Person');
    expect(error.recordId).toBe('p1');
    expect(error.message).toBe('Person p1 not found');
  });
});
