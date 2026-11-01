import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { getRestrictedFieldNamesFromRecord } from '@/object-record/record-store/utils/getRestrictedFieldNamesFromRecord';

describe('getRestrictedFieldNamesFromRecord', () => {
  it('should list the fields whose value is the restricted sentinel', () => {
    expect(
      getRestrictedFieldNamesFromRecord({
        record: {
          __typename: 'CalendarEvent',
          id: 'record-id',
          title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
          description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
          location: 'Office',
        },
      }),
    ).toEqual(['title', 'description']);
  });

  it('should return an empty list for an unrestricted or missing record', () => {
    expect(
      getRestrictedFieldNamesFromRecord({
        record: { __typename: 'CalendarEvent', id: 'record-id', title: 'Sync' },
      }),
    ).toEqual([]);
    expect(getRestrictedFieldNamesFromRecord({ record: null })).toEqual([]);
  });
});
