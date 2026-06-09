import { describe, expect, it } from 'vitest';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { extractCompanyMatchParams } from 'src/logic-functions/utils/extract-company-match-params';

describe('extractCompanyMatchParams', () => {
  it('prefers an existing pdlId', () => {
    expect(
      extractCompanyMatchParams({ ...COMPANY_NODE_MOCK, pdlId: 'pdl-c' }),
    ).toEqual({ pdlId: 'pdl-c' });
  });

  it('uses the domain and name when there is no pdlId', () => {
    expect(
      extractCompanyMatchParams({ ...COMPANY_NODE_MOCK, name: 'Acme' }),
    ).toEqual({ website: 'acme.com', name: 'Acme' });
  });

  it('returns undefined when there is no usable identifier', () => {
    expect(
      extractCompanyMatchParams({
        ...COMPANY_NODE_MOCK,
        domainName: null,
        name: '',
      }),
    ).toBeUndefined();
  });
});
