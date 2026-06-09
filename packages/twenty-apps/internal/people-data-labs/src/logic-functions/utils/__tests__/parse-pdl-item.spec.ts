import { describe, expect, it } from 'vitest';

import { parsePdlItem } from 'src/logic-functions/utils/parse-pdl-item';

describe('parsePdlItem', () => {
  it('maps a 200 item to a matched outcome with data and likelihood', () => {
    expect(parsePdlItem({ status: 200, likelihood: 8, data: { id: 'x' } })).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: { id: 'x' },
    });
  });

  it('falls back to the whole item as data when there is no data envelope', () => {
    expect(parsePdlItem({ status: 200, name: 'Acme' })).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: undefined,
      data: { status: 200, name: 'Acme' },
    });
  });

  it('maps a 404 item to not_found', () => {
    expect(parsePdlItem({ status: 404 })).toEqual({
      outcome: 'not_found',
      httpStatus: 404,
    });
  });

  it('maps a non-2xx item to an error with the PDL message', () => {
    expect(parsePdlItem({ status: 500, error: { message: 'boom' } })).toEqual({
      outcome: 'error',
      httpStatus: 500,
      message: 'boom',
    });
  });

  it('treats a non-object item as a malformed error', () => {
    expect(parsePdlItem(undefined)).toEqual({
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    });
  });
});
