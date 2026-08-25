import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { isRecordFilterEmpty } from 'src/engine/api/common/common-query-runners/utils/is-record-filter-empty.util';

describe('isRecordFilterEmpty', () => {
  it('should return true for a filter with no keys', () => {
    expect(isRecordFilterEmpty({})).toBe(true);
  });

  it('should return false for a filter with an id condition', () => {
    expect(
      isRecordFilterEmpty({
        id: { in: ['20202020-0000-0000-0000-000000000000'] },
      } as Partial<ObjectRecordFilter>),
    ).toBe(false);
  });

  it('should return false for a filter with a field condition', () => {
    expect(
      isRecordFilterEmpty({
        name: { eq: 'Twenty' },
      } as Partial<ObjectRecordFilter>),
    ).toBe(false);
  });
});
