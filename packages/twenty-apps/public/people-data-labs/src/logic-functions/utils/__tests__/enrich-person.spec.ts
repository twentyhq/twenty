import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { postPdlSingleEnrich } from 'src/logic-functions/utils/post-pdl-single-enrich';

vi.mock('src/logic-functions/utils/post-pdl-single-enrich', () => ({
  postPdlSingleEnrich: vi.fn(() =>
    Promise.resolve({ outcome: 'not_found', httpStatus: 404 }),
  ),
}));

const postPdlSingleEnrichMock = vi.mocked(postPdlSingleEnrich);

describe('enrichPerson', () => {
  beforeEach(() => {
    postPdlSingleEnrichMock.mockClear();
  });

  it('posts each record to the single person enrich endpoint with only the provided params', async () => {
    await enrichPerson([
      { email: 'a@b.com' },
      { pdlId: 'abc', name: 'Jane Doe', company: 'Acme' },
    ]);

    expect(postPdlSingleEnrichMock).toHaveBeenCalledTimes(2);
    expect(postPdlSingleEnrichMock).toHaveBeenNthCalledWith(1, {
      path: '/person/enrich',
      params: { email: 'a@b.com' },
    });
    expect(postPdlSingleEnrichMock).toHaveBeenNthCalledWith(2, {
      path: '/person/enrich',
      params: { pdl_id: 'abc', name: 'Jane Doe', company: 'Acme' },
    });
  });

  it('forwards min_likelihood when provided', async () => {
    await enrichPerson([{ profile: 'linkedin.com/in/jane', minLikelihood: 6 }]);

    expect(postPdlSingleEnrichMock).toHaveBeenCalledWith({
      path: '/person/enrich',
      params: { profile: 'linkedin.com/in/jane', min_likelihood: 6 },
    });
  });

  it('returns one outcome per request, preserving order', async () => {
    postPdlSingleEnrichMock
      .mockResolvedValueOnce({
        outcome: 'matched',
        httpStatus: 200,
        likelihood: 9,
        data: { id: '1' },
      })
      .mockResolvedValueOnce({ outcome: 'not_found', httpStatus: 404 });

    const results = await enrichPerson([{ email: 'a@b.com' }, { email: 'b@b.com' }]);

    expect(results).toEqual([
      { outcome: 'matched', httpStatus: 200, likelihood: 9, data: { id: '1' } },
      { outcome: 'not_found', httpStatus: 404 },
    ]);
  });
});
