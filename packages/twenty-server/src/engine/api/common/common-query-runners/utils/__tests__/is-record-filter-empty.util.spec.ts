import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { isRecordFilterEmpty } from 'src/engine/api/common/common-query-runners/utils/is-record-filter-empty.util';

const asFilter = (filter: unknown) => filter as Partial<ObjectRecordFilter>;

describe('isRecordFilterEmpty', () => {
  it('should treat a filter with no keys as empty', () => {
    expect(isRecordFilterEmpty({})).toBe(true);
  });

  it('should treat an empty "and" group as empty', () => {
    expect(isRecordFilterEmpty(asFilter({ and: [] }))).toBe(true);
  });

  it('should treat an empty "or" group as empty', () => {
    expect(isRecordFilterEmpty(asFilter({ or: [] }))).toBe(true);
  });

  it('should treat a "not" wrapping an empty filter as empty', () => {
    expect(isRecordFilterEmpty(asFilter({ not: {} }))).toBe(true);
  });

  it('should treat a group whose every element is empty as empty', () => {
    expect(isRecordFilterEmpty(asFilter({ and: [{}, { or: [] }] }))).toBe(true);
  });

  it('should not treat an id condition as empty', () => {
    expect(
      isRecordFilterEmpty(
        asFilter({ id: { in: ['20202020-0000-0000-0000-000000000000'] } }),
      ),
    ).toBe(false);
  });

  it('should not treat a field condition as empty', () => {
    expect(isRecordFilterEmpty(asFilter({ name: { eq: 'Twenty' } }))).toBe(
      false,
    );
  });

  it('should not treat a group holding a real condition as empty', () => {
    expect(
      isRecordFilterEmpty(asFilter({ and: [{}, { name: { eq: 'Twenty' } }] })),
    ).toBe(false);
  });

  it('should not treat a "not" wrapping a real condition as empty', () => {
    expect(
      isRecordFilterEmpty(asFilter({ not: { name: { eq: 'Twenty' } } })),
    ).toBe(false);
  });
});
