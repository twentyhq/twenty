import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichPeople } from 'src/logic-functions/utils/enrich-people';
import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';

vi.mock('src/logic-functions/utils/post-pdl-enrich', () => ({
  postPdlBulkEnrich: vi.fn(() => Promise.resolve([])),
}));

const postPdlBulkEnrichMock = vi.mocked(postPdlBulkEnrich);

describe('enrichPeople', () => {
  beforeEach(() => {
    postPdlBulkEnrichMock.mockClear();
  });

  it('posts every record to the person bulk endpoint with only the provided params', async () => {
    await enrichPeople([
      { email: 'jane@acme.com', minLikelihood: 6 },
      { pdlId: 'abc' },
    ]);

    expect(postPdlBulkEnrichMock).toHaveBeenCalledTimes(1);
    expect(postPdlBulkEnrichMock).toHaveBeenCalledWith('/person/bulk', [
      { email: 'jane@acme.com', min_likelihood: 6 },
      { pdl_id: 'abc' },
    ]);
  });
});
