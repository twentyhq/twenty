import { normalizeGraphQLErrorMessageForFingerprint } from '@/apollo/utils/normalizeGraphQLErrorMessageForFingerprint';

describe('normalizeGraphQLErrorMessageForFingerprint', () => {
  it('should give the same fingerprint to the same failure on different objects', () => {
    expect(
      normalizeGraphQLErrorMessageForFingerprint(
        'Cannot query field "companies" on type "Query".',
      ),
    ).toBe(
      normalizeGraphQLErrorMessageForFingerprint(
        'Cannot query field "people" on type "Query".',
      ),
    );
  });

  it('should strip the "Did you mean" suggestion', () => {
    expect(
      normalizeGraphQLErrorMessageForFingerprint(
        'Unknown type "LMETrackerFilterInput". Did you mean "ObjectRecordFilterInput"?',
      ),
    ).toBe('Unknown type "?".');
  });

  it('should strip single quoted values', () => {
    expect(
      normalizeGraphQLErrorMessageForFingerprint("Invalid UUID: 'available'"),
    ).toBe("Invalid UUID: '?'");
  });

  it('should strip uuids', () => {
    expect(
      normalizeGraphQLErrorMessageForFingerprint(
        'Record 6d33f8d2-5349-4856-bcc5-96a016a6d77c not found',
      ),
    ).toBe('Record ? not found');
  });

  it('should keep distinct failures distinct', () => {
    expect(
      normalizeGraphQLErrorMessageForFingerprint(
        'Cannot query field "companies" on type "Query".',
      ),
    ).not.toBe(
      normalizeGraphQLErrorMessageForFingerprint(
        'Unknown type "CompanyFilterInput".',
      ),
    );
  });
});
