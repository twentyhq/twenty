import { describe, expect, it } from 'vitest';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { extractCompanyMatchParams } from 'src/logic-functions/utils/extract-company-match-params';

const INPUT = { records: [] };

describe('extractCompanyMatchParams', () => {
  it('prefers an existing pdlId with the strong-identifier likelihood', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, pdlId: 'pdl-c' },
        input: INPUT,
      }),
    ).toEqual({ pdlId: 'pdl-c', minLikelihood: 2 });
  });

  it('uses the domain and name with the strong-identifier likelihood', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, name: 'Acme' },
        input: INPUT,
      }),
    ).toEqual({ website: 'acme.com', name: 'Acme', minLikelihood: 2 });
  });

  it('uses the linkedin profile as a strong identifier, stripped to the PDL path format', () => {
    expect(
      extractCompanyMatchParams({
        node: {
          ...COMPANY_NODE_MOCK,
          domainName: null,
          linkedinLink: {
            primaryLinkUrl: 'https://www.linkedin.com/company/acme/',
          },
          name: 'Acme',
        },
        input: INPUT,
      }),
    ).toEqual({
      profile: 'linkedin.com/company/acme',
      name: 'Acme',
      minLikelihood: 2,
    });
  });

  it('strips the scheme and www from the website before matching', () => {
    expect(
      extractCompanyMatchParams({
        node: {
          ...COMPANY_NODE_MOCK,
          domainName: { primaryLinkUrl: 'https://www.acme.com/' },
          name: 'Acme',
        },
        input: INPUT,
      }),
    ).toEqual({ website: 'acme.com', name: 'Acme', minLikelihood: 2 });
  });

  it('raises the likelihood when only a name is available', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, domainName: null, name: 'Acme' },
        input: INPUT,
      }),
    ).toEqual({ name: 'Acme', minLikelihood: 6 });
  });

  it('honors an explicit minLikelihood from the input', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, name: 'Acme' },
        input: { records: [], minLikelihood: 9 },
      }),
    ).toMatchObject({ minLikelihood: 9 });
  });

  it('returns undefined when there is no usable identifier', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, domainName: null, name: '' },
        input: INPUT,
      }),
    ).toBeUndefined();
  });
});
