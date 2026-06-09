import { describe, expect, it } from 'vitest';

import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { extractPersonMatchParams } from 'src/logic-functions/utils/extract-person-match-params';

describe('extractPersonMatchParams', () => {
  it('prefers an existing pdlId and uses the strong-identifier likelihood', () => {
    expect(
      extractPersonMatchParams(
        { ...PERSON_NODE_MOCK, pdlId: 'pdl-1' },
        { records: [] },
      ),
    ).toEqual({ pdlId: 'pdl-1', minLikelihood: 2 });
  });

  it('uses the linkedin profile with the strong-identifier likelihood', () => {
    expect(extractPersonMatchParams(PERSON_NODE_MOCK, { records: [] })).toEqual({
      profile: 'https://linkedin.com/in/existing',
      minLikelihood: 2,
    });
  });

  it('uses the weak-identifier likelihood when only a name is available', () => {
    expect(
      extractPersonMatchParams(
        {
          ...PERSON_NODE_MOCK,
          linkedinLink: null,
          name: { firstName: 'Jane', lastName: 'Doe' },
        },
        { records: [] },
      ),
    ).toEqual({ name: 'Jane Doe', minLikelihood: 6 });
  });

  it('honors an explicit minLikelihood from the input', () => {
    expect(
      extractPersonMatchParams(PERSON_NODE_MOCK, {
        records: [],
        minLikelihood: 9,
      }),
    ).toMatchObject({ minLikelihood: 9 });
  });

  it('returns undefined when there is no usable identifier', () => {
    expect(
      extractPersonMatchParams(
        { ...PERSON_NODE_MOCK, linkedinLink: null },
        { records: [] },
      ),
    ).toBeUndefined();
  });
});
