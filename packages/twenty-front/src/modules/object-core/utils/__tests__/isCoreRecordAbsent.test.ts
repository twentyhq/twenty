import { type ErrorLike } from '@apollo/client';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isCoreRecordAbsent } from '@/object-core/utils/isCoreRecordAbsent';

const RECORD = { __typename: 'Workflow', id: 'core-id' } as ObjectRecord;

describe('isCoreRecordAbsent', () => {
  it('is true once the query settled without a row', () => {
    expect(
      isCoreRecordAbsent({
        record: undefined,
        loading: false,
        error: undefined,
      }),
    ).toBe(true);
  });

  it('is false while the query is still loading', () => {
    expect(
      isCoreRecordAbsent({
        record: undefined,
        loading: true,
        error: undefined,
      }),
    ).toBe(false);
  });

  it('is false when the query failed, so an outage is not read as a missing row', () => {
    expect(
      isCoreRecordAbsent({
        record: undefined,
        loading: false,
        error: new Error('core unavailable') as ErrorLike,
      }),
    ).toBe(false);
  });

  it('is false when core returned a row', () => {
    expect(
      isCoreRecordAbsent({ record: RECORD, loading: false, error: undefined }),
    ).toBe(false);
  });
});
