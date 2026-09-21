import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';

vi.mock('src/logic-functions/utils/post-pdl-single-enrich', () => ({
  postPdlSingleEnrich: vi.fn(() =>
    Promise.resolve({ outcome: 'not_found', httpStatus: 404 }),
  ),
}));

const postPdlSingleEnrichMock = vi.mocked(postPdlSingleEnrich);

describe('enrichCompany', () => {
  beforeEach(() => {
    postPdlSingleEnrichMock.mockClear();
  });

  it('posts each record to the single company enrich endpoint with only the provided params', async () => {
    await enrichCompany([{ website: 'acme.com' }, { pdlId: 'abc' }]);

    expect(postPdlSingleEnrichMock).toHaveBeenCalledTimes(2);
    expect(postPdlSingleEnrichMock).toHaveBeenNthCalledWith(1, {
      path: '/company/enrich',
      params: { website: 'acme.com' },
    });
    expect(postPdlSingleEnrichMock).toHaveBeenNthCalledWith(2, {
      path: '/company/enrich',
      params: { pdl_id: 'abc' },
    });
  });

  it('forwards min_likelihood when provided', async () => {
    await enrichCompany([{ name: 'Acme', minLikelihood: 2 }]);

    expect(postPdlSingleEnrichMock).toHaveBeenCalledWith({
      path: '/company/enrich',
      params: { name: 'Acme', min_likelihood: 2 },
    });
  });

  it('returns one outcome per request, preserving order', async () => {
    postPdlSingleEnrichMock
      .mockResolvedValueOnce({ outcome: 'matched', httpStatus: 200, data: { id: '1' } })
      .mockResolvedValueOnce({ outcome: 'not_found', httpStatus: 404 });

    const results = await enrichCompany([{ website: 'a.com' }, { website: 'b.com' }]);

    expect(results).toEqual([
      { outcome: 'matched', httpStatus: 200, data: { id: '1' } },
      { outcome: 'not_found', httpStatus: 404 },
    ]);
  });
});
