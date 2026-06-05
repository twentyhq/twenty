import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { postPdlEnrich } from 'src/logic-functions/utils/post-pdl-enrich';

vi.mock('src/logic-functions/utils/post-pdl-enrich', () => ({
  postPdlEnrich: vi.fn(() => Promise.resolve({ outcome: 'not_found', httpStatus: 404 })),
}));

const postPdlEnrichMock = vi.mocked(postPdlEnrich);

describe('enrichPerson', () => {
  beforeEach(() => {
    postPdlEnrichMock.mockClear();
  });

  it('posts to the person endpoint with only the provided params', async () => {
    await enrichPerson({ email: 'jane@acme.com', minLikelihood: 6 });

    expect(postPdlEnrichMock).toHaveBeenCalledWith('/person/enrich', {
      email: 'jane@acme.com',
      min_likelihood: 6,
    });
  });

  it('maps the pdlId param to pdl_id', async () => {
    await enrichPerson({ pdlId: 'abc' });

    expect(postPdlEnrichMock).toHaveBeenCalledWith('/person/enrich', {
      pdl_id: 'abc',
    });
  });
});
