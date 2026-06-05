import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { postPdlEnrich } from 'src/logic-functions/utils/post-pdl-enrich';

vi.mock('src/logic-functions/utils/post-pdl-enrich', () => ({
  postPdlEnrich: vi.fn(() => Promise.resolve({ outcome: 'not_found', httpStatus: 404 })),
}));

const postPdlEnrichMock = vi.mocked(postPdlEnrich);

describe('enrichCompany', () => {
  beforeEach(() => {
    postPdlEnrichMock.mockClear();
  });

  it('posts to the company endpoint with only the provided params', async () => {
    await enrichCompany({ website: 'acme.com' });

    expect(postPdlEnrichMock).toHaveBeenCalledWith('/company/enrich', {
      website: 'acme.com',
    });
  });

  it('maps the pdlId param to pdl_id', async () => {
    await enrichCompany({ pdlId: 'abc' });

    expect(postPdlEnrichMock).toHaveBeenCalledWith('/company/enrich', {
      pdl_id: 'abc',
    });
  });
});
