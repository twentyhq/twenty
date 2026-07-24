import { parsePeopleDataLabsResponseItem } from 'src/engine/core-modules/company-enrichment/utils/parse-people-data-labs-response-item.util';

describe('parsePeopleDataLabsResponseItem', () => {
  it('maps a 200 item to a matched outcome with data and likelihood', () => {
    expect(
      parsePeopleDataLabsResponseItem({
        item: { status: 200, likelihood: 8, data: { id: 'x' } },
      }),
    ).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: { id: 'x' },
    });
  });

  it('defaults a missing status to 200 and matches when data is present', () => {
    expect(
      parsePeopleDataLabsResponseItem({ item: { data: { id: 'x' } } }),
    ).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: undefined,
      data: { id: 'x' },
    });
  });

  it('matches a 200 item whose record fields are at the top level (company bulk shape)', () => {
    expect(
      parsePeopleDataLabsResponseItem({
        item: { status: 200, likelihood: 6, id: 'x', name: 'Acme' },
      }),
    ).toEqual({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 6,
      data: { id: 'x', name: 'Acme' },
    });
  });

  it('treats a 200 item carrying only the envelope as not_found', () => {
    expect(
      parsePeopleDataLabsResponseItem({ item: { status: 200, likelihood: 6 } }),
    ).toEqual({
      outcome: 'not_found',
      httpStatus: 200,
    });
  });

  it('rejects a match whose likelihood is below the requested threshold', () => {
    expect(
      parsePeopleDataLabsResponseItem({
        item: { status: 200, likelihood: 3, data: { id: 'x' } },
        requestedMinLikelihood: 6,
      }),
    ).toEqual({ outcome: 'not_found', httpStatus: 200 });
  });

  it('keeps a match whose likelihood meets the requested threshold', () => {
    expect(
      parsePeopleDataLabsResponseItem({
        item: { status: 200, likelihood: 6, data: { id: 'x' } },
        requestedMinLikelihood: 6,
      }),
    ).toMatchObject({ outcome: 'matched', likelihood: 6 });
  });

  it('maps a 404 item to not_found', () => {
    expect(parsePeopleDataLabsResponseItem({ item: { status: 404 } })).toEqual({
      outcome: 'not_found',
      httpStatus: 404,
    });
  });

  it('maps a non-2xx item to an error with the People Data Labs message', () => {
    expect(
      parsePeopleDataLabsResponseItem({
        item: { status: 500, error: { message: 'boom' } },
      }),
    ).toEqual({
      outcome: 'error',
      httpStatus: 500,
      message: 'boom',
    });
  });

  it('treats a non-object item as a malformed error', () => {
    expect(parsePeopleDataLabsResponseItem({ item: undefined })).toEqual({
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    });
  });
});
