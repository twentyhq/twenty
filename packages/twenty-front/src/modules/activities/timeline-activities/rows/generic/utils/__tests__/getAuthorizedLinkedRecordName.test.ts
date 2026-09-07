import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { getAuthorizedLinkedRecordName } from '@/activities/timeline-activities/rows/generic/utils/getAuthorizedLinkedRecordName';

describe('getAuthorizedLinkedRecordName', () => {
  it('returns a readable live record identifier', () => {
    expect(getAuthorizedLinkedRecordName('Quarterly planning')).toBe(
      'Quarterly planning',
    );
  });

  it('does not expose a restricted-field marker', () => {
    expect(
      getAuthorizedLinkedRecordName(
        FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBeUndefined();
  });

  it('does not manufacture a fallback when the record is unavailable', () => {
    expect(getAuthorizedLinkedRecordName(undefined)).toBeUndefined();
  });
});
