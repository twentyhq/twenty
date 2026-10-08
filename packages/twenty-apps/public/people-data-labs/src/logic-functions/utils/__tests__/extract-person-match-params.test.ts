import { describe, expect, it } from 'vitest';

import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { extractPersonMatchParams } from 'src/logic-functions/utils/extract-person-match-params';
import { type MinLikelihoods } from 'src/types/min-likelihoods';

const MIN_LIKELIHOODS: MinLikelihoods = {
  strongIdentifierMinLikelihood: 3,
  weakIdentifierMinLikelihood: 7,
};

describe('extractPersonMatchParams', () => {
  it('prefers an existing pdlId and uses the strong-identifier likelihood', () => {
    expect(
      extractPersonMatchParams({
        node: { ...PERSON_NODE_MOCK, pdlId: 'pdl-1' },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({ pdlId: 'pdl-1', minLikelihood: 3 });
  });

  it('uses the linkedin profile with the strong-identifier likelihood', () => {
    expect(
      extractPersonMatchParams({
        node: PERSON_NODE_MOCK,
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({
      profile: 'https://linkedin.com/in/existing',
      minLikelihood: 3,
    });
  });

  it('pairs a name with the person company and uses the weak-identifier likelihood', () => {
    expect(
      extractPersonMatchParams({
        node: {
          ...PERSON_NODE_MOCK,
          linkedinLink: null,
          name: { firstName: 'Jane', lastName: 'Doe' },
          company: { id: 'co-1', name: 'Acme' },
        },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toEqual({ name: 'Jane Doe', company: 'Acme', minLikelihood: 7 });
  });

  it('returns undefined for a name with no anchoring identifier or company', () => {
    expect(
      extractPersonMatchParams({
        node: {
          ...PERSON_NODE_MOCK,
          linkedinLink: null,
          name: { firstName: 'Jane', lastName: 'Doe' },
        },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toBeUndefined();
  });

  it('returns undefined when there is no usable identifier', () => {
    expect(
      extractPersonMatchParams({
        node: { ...PERSON_NODE_MOCK, linkedinLink: null },
        minLikelihoods: MIN_LIKELIHOODS,
      }),
    ).toBeUndefined();
  });
});
