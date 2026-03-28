import {
  scoreLeadMatch,
  extractLeadCsvData,
  AUTO_RESOLVE_THRESHOLD,
  REVIEW_THRESHOLD,
  type LeadCandidate,
  type LeadCsvData,
} from '../scoreLeadMatch';

describe('scoreLeadMatch', () => {
  const makeCandidate = (
    overrides: Partial<LeadCandidate> = {},
  ): LeadCandidate => ({
    id: 'candidate-1',
    nameFirstName: 'Leigh',
    nameLastName: 'Barnett',
    emailsPrimaryEmail: 'barnettleigh4@gmail.com',
    phonesPrimaryPhoneNumber: '9313359487',
    addressCity: 'Adamsville',
    addressState: 'Alabama',
    ...overrides,
  });

  const makeCsvData = (overrides: Partial<LeadCsvData> = {}): LeadCsvData => ({
    firstName: 'Leigh',
    lastName: 'Barnett',
    email: 'barnettleigh4@gmail.com',
    phone: '9313359487',
    city: 'Adamsville',
    state: 'Alabama',
    ...overrides,
  });

  it('scores 110 for a perfect match (all fields)', () => {
    const result = scoreLeadMatch(makeCandidate(), makeCsvData());

    expect(result.score).toBe(110);
    expect(result.breakdown).toEqual({
      email: 50,
      firstName: 15,
      lastName: 15,
      phone: 20,
      city: 5,
      state: 5,
    });
  });

  it('scores 80 for email + name match (no phone, no address)', () => {
    const candidate = makeCandidate({
      phonesPrimaryPhoneNumber: '0000000000',
      addressCity: undefined,
      addressState: undefined,
    });
    const csvData = makeCsvData({ city: undefined, state: undefined });

    const result = scoreLeadMatch(candidate, csvData);

    expect(result.score).toBe(80);
    expect(result.score).toBeGreaterThanOrEqual(AUTO_RESOLVE_THRESHOLD);
  });

  it('scores 50 for email match only', () => {
    const candidate = makeCandidate({
      nameFirstName: 'Jane',
      nameLastName: 'Smith',
      phonesPrimaryPhoneNumber: '0000000000',
      addressCity: 'Other City',
      addressState: 'Other State',
    });

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.score).toBe(50);
    expect(result.breakdown.email).toBe(50);
  });

  it('scores 30 for name match only', () => {
    const candidate = makeCandidate({
      emailsPrimaryEmail: 'different@email.com',
      phonesPrimaryPhoneNumber: '0000000000',
      addressCity: undefined,
      addressState: undefined,
    });
    const csvData = makeCsvData({ city: undefined, state: undefined });

    const result = scoreLeadMatch(candidate, csvData);

    expect(result.score).toBe(30);
  });

  it('email + name exceeds auto-resolve threshold', () => {
    const candidate = makeCandidate({
      phonesPrimaryPhoneNumber: '+1 35005', // wrong phone
      addressCity: undefined,
      addressState: undefined,
    });
    const csvData = makeCsvData({ city: undefined, state: undefined });

    const result = scoreLeadMatch(candidate, csvData);

    // email(50) + firstName(15) + lastName(15) = 80
    expect(result.score).toBe(80);
    expect(result.score).toBeGreaterThanOrEqual(AUTO_RESOLVE_THRESHOLD);
  });

  it('normalizes phone numbers for matching', () => {
    const candidate = makeCandidate({
      phonesPrimaryPhoneNumber: '+1-931-335-9487',
    });

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.breakdown.phone).toBe(20);
  });

  it('handles case-insensitive email matching', () => {
    const candidate = makeCandidate({
      emailsPrimaryEmail: 'BarnettLeigh4@Gmail.COM',
    });

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.breakdown.email).toBe(50);
  });

  it('handles case-insensitive name matching', () => {
    const candidate = makeCandidate({
      nameFirstName: 'LEIGH',
      nameLastName: 'barnett',
    });

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.breakdown.firstName).toBe(15);
    expect(result.breakdown.lastName).toBe(15);
  });

  it('handles fuzzy name matching (first 3 chars)', () => {
    const candidate = makeCandidate({
      nameFirstName: 'Leigha', // starts with same 3 chars
    });

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.breakdown.firstName).toBe(10); // fuzzy, not exact
  });

  it('scores 0 for completely different person', () => {
    const candidate = makeCandidate({
      nameFirstName: 'John',
      nameLastName: 'Smith',
      emailsPrimaryEmail: 'john@example.com',
      phonesPrimaryPhoneNumber: '1111111111',
      addressCity: 'New York',
      addressState: 'New York',
    });

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.score).toBe(0);
  });

  it('scores below review threshold for weak match', () => {
    const candidate = makeCandidate({
      nameFirstName: 'Leigh',
      nameLastName: 'Smith', // different last name
      emailsPrimaryEmail: 'different@email.com',
      phonesPrimaryPhoneNumber: '0000000000',
      addressCity: undefined,
      addressState: undefined,
    });
    const csvData = makeCsvData({ city: undefined, state: undefined });

    const result = scoreLeadMatch(candidate, csvData);

    // firstName(15) only
    expect(result.score).toBe(15);
    expect(result.score).toBeLessThan(REVIEW_THRESHOLD);
  });

  it('handles undefined candidate fields gracefully', () => {
    const candidate: LeadCandidate = { id: 'empty' };

    const result = scoreLeadMatch(candidate, makeCsvData());

    expect(result.score).toBe(0);
  });

  it('handles undefined csv fields gracefully', () => {
    const csvData: LeadCsvData = {};

    const result = scoreLeadMatch(makeCandidate(), csvData);

    expect(result.score).toBe(0);
  });
});

describe('extractLeadCsvData', () => {
  it('extracts lead fields from structured row', () => {
    const row: Record<string, unknown> = {
      id: '7a953086-45ee-472d-aa6b-2cc5ce88cb83',
      'update:firstName-name (lead)': 'Leigh',
      'update:lastName-name (lead)': 'Barnett',
      'update:primaryEmail-emails (lead)': 'barnettleigh4@gmail.com',
      'primaryPhoneNumber-phones (lead)': '9313359487',
      'update:addressCity-addressCustom (lead)': 'Adamsville',
      'update:addressState-addressCustom (lead)': 'Alabama',
    };

    const result = extractLeadCsvData(row, 'lead');

    expect(result).toEqual({
      firstName: 'Leigh',
      lastName: 'Barnett',
      email: 'barnettleigh4@gmail.com',
      phone: '9313359487',
      city: 'Adamsville',
      state: 'Alabama',
    });
  });

  it('returns undefined fields when not present', () => {
    const row: Record<string, unknown> = {
      id: 'test-id',
      'primaryPhoneNumber-phones (lead)': '1234567890',
    };

    const result = extractLeadCsvData(row, 'lead');

    expect(result.phone).toBe('1234567890');
    expect(result.firstName).toBeUndefined();
    expect(result.email).toBeUndefined();
  });
});
