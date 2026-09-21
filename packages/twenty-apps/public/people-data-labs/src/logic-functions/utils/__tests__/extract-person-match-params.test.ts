import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { extractPersonMatchParams } from 'src/logic-functions/utils/extract-person-match-params';

describe('extractPersonMatchParams', () => {
  beforeEach(() => {
    vi.stubEnv('PDL_PERSON_MIN_LIKELIHOOD', undefined);
    vi.stubEnv('PDL_COMPANY_MIN_LIKELIHOOD', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    { name: 'a PDL ID', node: { ...PERSON_NODE_MOCK, pdlId: 'pdl-1' } },
    { name: 'a LinkedIn profile', node: PERSON_NODE_MOCK },
    {
      name: 'a name and company',
      node: {
        ...PERSON_NODE_MOCK,
        linkedinLink: null,
        name: { firstName: 'Jane', lastName: 'Doe' },
        company: { id: 'co-1', name: 'Acme' },
      },
    },
  ])('uses the person default when matching by $name', ({ node }) => {
    vi.stubEnv('PDL_PERSON_MIN_LIKELIHOOD', '7');
    vi.stubEnv('PDL_COMPANY_MIN_LIKELIHOOD', '8');

    expect(
      extractPersonMatchParams({ node, input: { records: [] } }),
    ).toMatchObject({ minLikelihood: 7 });
  });

  it('prefers an existing pdlId and uses the strong-identifier likelihood', () => {
    expect(
      extractPersonMatchParams({
        node: { ...PERSON_NODE_MOCK, pdlId: 'pdl-1' },
        input: { records: [] },
      }),
    ).toEqual({ pdlId: 'pdl-1', minLikelihood: 2 });
  });

  it('uses the linkedin profile with the strong-identifier likelihood', () => {
    expect(
      extractPersonMatchParams({
        node: PERSON_NODE_MOCK,
        input: { records: [] },
      }),
    ).toEqual({
      profile: 'https://linkedin.com/in/existing',
      minLikelihood: 2,
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
        input: { records: [] },
      }),
    ).toEqual({ name: 'Jane Doe', company: 'Acme', minLikelihood: 6 });
  });

  it('returns undefined for a name with no anchoring identifier or company', () => {
    expect(
      extractPersonMatchParams({
        node: {
          ...PERSON_NODE_MOCK,
          linkedinLink: null,
          name: { firstName: 'Jane', lastName: 'Doe' },
        },
        input: { records: [] },
      }),
    ).toBeUndefined();
  });

  it('honors an explicit minLikelihood from the input', () => {
    vi.stubEnv('PDL_PERSON_MIN_LIKELIHOOD', '7');

    expect(
      extractPersonMatchParams({
        node: PERSON_NODE_MOCK,
        input: {
          records: [],
          minLikelihood: 9,
        },
      }),
    ).toMatchObject({ minLikelihood: 9 });
  });

  it('returns undefined when there is no usable identifier', () => {
    expect(
      extractPersonMatchParams({
        node: { ...PERSON_NODE_MOCK, linkedinLink: null },
        input: { records: [] },
      }),
    ).toBeUndefined();
  });
});
