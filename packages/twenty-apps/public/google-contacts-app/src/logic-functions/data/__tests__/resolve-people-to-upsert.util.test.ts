import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ExistingTwentyPeople } from 'src/logic-functions/data/fetch-people-for-sync.util';
import {
  resolvePeopleToUpsert,
  type SyncCandidate,
} from 'src/logic-functions/data/resolve-people-to-upsert.util';
import { type TwentyPersonInput } from 'src/logic-functions/types/twenty-person.type';

// The sync writes every field it owns, so the input always carries them all.
const buildPersonInput = (
  googleContactsId: string,
  primaryEmail: string | null,
): TwentyPersonInput => ({
  googleContactsId,
  name: { firstName: '', lastName: '' },
  emails: { primaryEmail, additionalEmails: [] },
  phones: {
    primaryPhoneNumber: '',
    primaryPhoneCallingCode: '',
    primaryPhoneCountryCode: '',
    additionalPhones: [],
  },
  jobTitle: '',
  linkedinLink: {
    primaryLinkUrl: '',
    primaryLinkLabel: '',
    secondaryLinks: null,
  },
  avatarUrl: '',
});

const buildCandidate = (
  googleContactsId: string,
  googleUpdatedAt: string | undefined,
  primaryEmail: string | null = null,
): SyncCandidate => ({
  googleUpdatedAt,
  organization: undefined,
  personInput: buildPersonInput(googleContactsId, primaryEmail),
});

const buildExistingPeople = (
  overrides: Partial<ExistingTwentyPeople> = {},
): ExistingTwentyPeople => ({
  byGoogleContactsId: new Map(),
  byPrimaryEmail: new Map(),
  ...overrides,
});

const resolve = (
  candidates: SyncCandidate[],
  existingPeople: ExistingTwentyPeople,
  claimedPrimaryEmails = new Set<string>(),
) =>
  resolvePeopleToUpsert({ candidates, existingPeople, claimedPrimaryEmails });

const readIds = (
  candidates: SyncCandidate[],
  existingPeople: ExistingTwentyPeople,
) =>
  resolve(candidates, existingPeople).map(
    ({ personInput }) => personInput.googleContactsId,
  );

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('resolvePeopleToUpsert', () => {
  it('should upsert a contact Twenty has never seen', () => {
    const candidates = [buildCandidate('c1', '2024-01-02T00:00:00Z')];

    expect(resolve(candidates, buildExistingPeople())).toEqual([
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

    expect(resolve(candidates, existingPeople)[0].personInput.id).toBe('p1');
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

  it('should skip a contact whose email belongs to a person linked elsewhere', () => {
    const candidates = [
      buildCandidate('c1', '2024-01-02T00:00:00Z', 'john@example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byPrimaryEmail: new Map([
        ['john@example.com', { id: 'p1', googleContactsId: 'c2' }],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual([]);
  });

  it('should skip a linked contact that took over the email of another person', () => {
    const candidates = [
      buildCandidate('c1', '2024-01-02T00:00:00Z', 'john@example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byGoogleContactsId: new Map([['c1', { id: 'p1' }]]),
      byPrimaryEmail: new Map([
        ['john@example.com', { id: 'p2', googleContactsId: null }],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual([]);
  });

  it('should keep a linked contact still holding its own email', () => {
    const candidates = [
      buildCandidate('c1', '2024-01-02T00:00:00Z', 'john@example.com'),
    ];
    const existingPeople = buildExistingPeople({
      byGoogleContactsId: new Map([['c1', { id: 'p1' }]]),
      byPrimaryEmail: new Map([
        ['john@example.com', { id: 'p1', googleContactsId: 'c1' }],
      ]),
    });

    expect(readIds(candidates, existingPeople)).toEqual(['c1']);
  });

  it('should keep only the first of two contacts sharing an email across pages', () => {
    const claimedPrimaryEmails = new Set<string>();
    const firstPage = [buildCandidate('c1', undefined, 'john@example.com')];
    const secondPage = [buildCandidate('c2', undefined, 'JOHN@example.com')];

    const readPage = (candidates: SyncCandidate[]) =>
      resolve(candidates, buildExistingPeople(), claimedPrimaryEmails).map(
        ({ personInput }) => personInput.googleContactsId,
      );

    expect(readPage(firstPage)).toEqual(['c1']);
    expect(readPage(secondPage)).toEqual([]);
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

    const resolved = resolve(candidates, existingPeople);

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
