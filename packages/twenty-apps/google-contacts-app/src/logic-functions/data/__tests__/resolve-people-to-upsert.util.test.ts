import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ExistingTwentyPeople } from 'src/logic-functions/data/fetch-people-for-sync.util';
import {
  resolvePeopleToUpsert,
  type SyncCandidate,
} from 'src/logic-functions/data/resolve-people-to-upsert.util';

const buildCandidate = (
  googleContactsId: string,
  googleUpdatedAt: string | undefined,
  primaryEmail?: string,
): SyncCandidate => ({
  googleUpdatedAt,
  organization: undefined,
  personInput: {
    googleContactsId,
    ...(primaryEmail === undefined
      ? {}
      : { emails: { primaryEmail, additionalEmails: [] } }),
  },
});

const buildExistingPeople = (
  overrides: Partial<ExistingTwentyPeople> = {},
): ExistingTwentyPeople => ({
  byGoogleContactsId: new Map(),
  byPrimaryEmail: new Map(),
  ...overrides,
});

const readIds = (
  candidates: SyncCandidate[],
  existingPeople: ExistingTwentyPeople,
) =>
  resolvePeopleToUpsert({ candidates, existingPeople }).map(
    ({ personInput }) => personInput.googleContactsId,
  );

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('resolvePeopleToUpsert', () => {
  it('should upsert a contact Twenty has never seen', () => {
    const candidates = [buildCandidate('c1', '2024-01-02T00:00:00Z')];

    expect(
      resolvePeopleToUpsert({
        candidates,
        existingPeople: buildExistingPeople(),
      }),
    ).toEqual([
      { personInput: candidates[0].personInput, organization: undefined },
    ]);
  });

  it('should upsert a linked person Google changed more recently', () => {
    const candidates = [buildCandidate('c1', '2024-01-02T00:00:00Z')];
    const existingPeople = buildExistingPeople({
      byGoogleContactsId: new Map([
        ['c1', { id: 'p1', updatedAt: '2024-01-01T00:00:00Z' }],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual(['c1']);
  });

  it('should leave a linked person edited in Twenty since Google last changed', () => {
    const candidates = [buildCandidate('c1', '2024-01-01T00:00:00Z')];
    const existingPeople = buildExistingPeople({
      byGoogleContactsId: new Map([
        ['c1', { id: 'p1', updatedAt: '2024-01-02T00:00:00Z' }],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual([]);
  });

  it('should let Google win when either timestamp is missing', () => {
    const candidates = [buildCandidate('c1', undefined)];
    const existingPeople = buildExistingPeople({
      byGoogleContactsId: new Map([
        ['c1', { id: 'p1', updatedAt: '2024-01-02T00:00:00Z' }],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual(['c1']);
  });

  it('should adopt an unlinked person reachable at the same address', () => {
    const candidates = [
      buildCandidate('c1', '2024-01-02T00:00:00Z', 'John@Example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byPrimaryEmail: new Map([
        ['john@example.com', { id: 'p1', googleContactsId: null }],
      ]),
    });

    expect(
      resolvePeopleToUpsert({ candidates, existingPeople })[0].personInput.id,
    ).toBe('p1');
  });

  it('should leave an adopted person edited in Twenty since Google last changed', () => {
    const candidates = [
      buildCandidate('c1', '2024-01-01T00:00:00Z', 'john@example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byPrimaryEmail: new Map([
        [
          'john@example.com',
          {
            id: 'p1',
            googleContactsId: null,
            updatedAt: '2024-01-02T00:00:00Z',
          },
        ],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual([]);
  });

  it('should not adopt a person already linked to another Google contact', () => {
    const candidates = [
      buildCandidate('c1', '2024-01-02T00:00:00Z', 'john@example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byPrimaryEmail: new Map([
        ['john@example.com', { id: 'p1', googleContactsId: 'c2' }],
      ]),
    });

    expect(
      resolvePeopleToUpsert({ candidates, existingPeople })[0].personInput.id,
    ).toBeUndefined();
  });

  it('should keep only the first of two contacts sharing a primary email', () => {
    const candidates = [
      buildCandidate('c1', undefined, 'john@example.com'),
      buildCandidate('c2', undefined, 'JOHN@example.com'),
    ];

    expect(readIds(candidates, buildExistingPeople())).toEqual(['c1']);
  });

  it('should not let two contacts sharing an email adopt the same person', () => {
    const candidates = [
      buildCandidate('c1', undefined, 'john@example.com'),
      buildCandidate('c2', undefined, 'john@example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byPrimaryEmail: new Map([
        ['john@example.com', { id: 'p1', googleContactsId: null }],
      ]),
    });

    const resolved = resolvePeopleToUpsert({ candidates, existingPeople });

    expect(resolved.map(({ personInput }) => personInput.id)).toEqual(['p1']);
  });

  it('should keep contacts that carry no email at all', () => {
    const candidates = [
      buildCandidate('c1', undefined),
      buildCandidate('c2', undefined),
    ];

    expect(readIds(candidates, buildExistingPeople())).toEqual(['c1', 'c2']);
  });
});
