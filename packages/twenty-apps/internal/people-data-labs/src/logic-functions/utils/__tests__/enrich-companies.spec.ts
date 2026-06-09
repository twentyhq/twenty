import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enrichCompanies } from 'src/logic-functions/utils/enrich-companies';
import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';

vi.mock('src/logic-functions/utils/post-pdl-enrich', () => ({
  postPdlBulkEnrich: vi.fn(() => Promise.resolve([])),
}));

const postPdlBulkEnrichMock = vi.mocked(postPdlBulkEnrich);

describe('enrichCompanies', () => {
  beforeEach(() => {
    postPdlBulkEnrichMock.mockClear();
  });

  it('posts every record to the company bulk endpoint with only the provided params', async () => {
    await enrichCompanies([{ website: 'acme.com' }, { pdlId: 'abc' }]);

    expect(postPdlBulkEnrichMock).toHaveBeenCalledTimes(1);
    expect(postPdlBulkEnrichMock).toHaveBeenCalledWith('/company/enrich/bulk', [
      { website: 'acme.com' },
      { pdl_id: 'abc' },
    ]);
  });
});
