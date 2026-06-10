import { describe, expect, it } from 'vitest';

import { parsePdlItem } from 'src/logic-functions/utils/parse-pdl-item';

describe('parsePdlItem', () => {
  it('maps a 200 item to a matched outcome with data and likelihood', () => {
    expect(
      parsePdlItem({ item: { status: 200, likelihood: 8, data: { id: 'x' } } }),
    ).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: { id: 'x' },
    });
  });

  it('defaults a missing status to 200 and matches when data is present', () => {
    expect(parsePdlItem({ item: { data: { id: 'x' } } })).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: undefined,
      data: { id: 'x' },
    });
  });

  it('treats a 200 item without a data envelope as not_found', () => {
    expect(parsePdlItem({ item: { status: 200, name: 'Acme' } })).toEqual({
      outcome: 'not_found',
      httpStatus: 200,
    });
  });

  it('rejects a match whose likelihood is below the requested threshold', () => {
    expect(
      parsePdlItem({
        item: { status: 200, likelihood: 3, data: { id: 'x' } },
        requestedMinLikelihood: 6,
      }),
    ).toEqual({ outcome: 'not_found', httpStatus: 200 });
  });

  it('keeps a match whose likelihood meets the requested threshold', () => {
    expect(
      parsePdlItem({
        item: { status: 200, likelihood: 6, data: { id: 'x' } },
        requestedMinLikelihood: 6,
      }),
    ).toMatchObject({ outcome: 'matched', likelihood: 6 });
  });

  it('maps a 404 item to not_found', () => {
    expect(parsePdlItem({ item: { status: 404 } })).toEqual({
      outcome: 'not_found',
      httpStatus: 404,
    });
  });

  it('maps a non-2xx item to an error with the PDL message', () => {
    expect(
      parsePdlItem({ item: { status: 500, error: { message: 'boom' } } }),
    ).toEqual({
      outcome: 'error',
      httpStatus: 500,
      message: 'boom',
    });
  });

  it('treats a non-object item as a malformed error', () => {
    expect(parsePdlItem({ item: undefined })).toEqual({
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    });
  });
});
