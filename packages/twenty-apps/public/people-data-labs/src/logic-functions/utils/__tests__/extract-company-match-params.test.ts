import { describe, expect, it } from 'vitest';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { extractCompanyMatchParams } from 'src/logic-functions/utils/extract-company-match-params';
import { type MinLikelihoods } from 'src/types/min-likelihoods';

const MIN_LIKELIHOODS: MinLikelihoods = {
  strongIdentifierMinLikelihood: 3,
  weakIdentifierMinLikelihood: 7,
};

describe('extractCompanyMatchParams', () => {
  it('prefers an existing pdlId with the strong-identifier likelihood', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, pdlId: 'pdl-c' },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({ pdlId: 'pdl-c', minLikelihood: 3 });
  });

  it('uses the domain and name with the strong-identifier likelihood', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, name: 'Acme' },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({ website: 'acme.com', name: 'Acme', minLikelihood: 3 });
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
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({
      profile: 'linkedin.com/company/acme',
      name: 'Acme',
      minLikelihood: 3,
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
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({ website: 'acme.com', name: 'Acme', minLikelihood: 3 });
  });

  it('uses the weak-identifier likelihood when only a name is available', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, domainName: null, name: 'Acme' },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({ name: 'Acme', minLikelihood: 7 });
  });

  it('returns undefined when there is no usable identifier', () => {
    expect(
      extractCompanyMatchParams({
        node: { ...COMPANY_NODE_MOCK, domainName: null, name: '' },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toBeUndefined();
  });
});
