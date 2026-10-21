import { getAuthorizedLinkedRecordName } from '@/activities/timeline-activities/rows/generic/utils/getAuthorizedLinkedRecordName';

describe('getAuthorizedLinkedRecordName', () => {
  it('returns a readable live record identifier', () => {
    expect(
      getAuthorizedLinkedRecordName({
        name: 'Quarterly planning',
        isNameRestricted: false,
      }),
    ).toBe('Quarterly planning');
  });

  it('does not expose the name of a restricted record', () => {
    expect(
      getAuthorizedLinkedRecordName({
        name: 'Not shared',
        isNameRestricted: true,
      }),
    ).toBeUndefined();
  });

  it('does not manufacture a fallback when the record is unavailable', () => {
    expect(getAuthorizedLinkedRecordName(null)).toBeUndefined();
    expect(getAuthorizedLinkedRecordName({ name: '' })).toBeUndefined();
  });
});
