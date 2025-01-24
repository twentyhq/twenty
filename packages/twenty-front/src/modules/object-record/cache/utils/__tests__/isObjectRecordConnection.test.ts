import { peopleQueryResult } from '~/testing/mock-data/people';

import { isObjectRecordConnection } from '@/object-record/cache/utils/isObjectRecordConnection';

// TODO refactor consuming relation from mockss
describe('isObjectRecordConnection', () => {
  it('should work with query result', () => {
    const validQueryResult = peopleQueryResult.people;

    const isValidQueryResult = isObjectRecordConnection(
      {},
      validQueryResult,
    );

    expect(isValidQueryResult).toEqual(true);
  });

  it('should fail with invalid result', () => {
    const invalidResult = { test: 123 };

    const isValidQueryResult = isObjectRecordConnection(
      'person',
      invalidResult,
    );

    expect(isValidQueryResult).toEqual(false);
  });
});
