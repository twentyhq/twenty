import {
  assertRecordFilterIsNotEmpty,
  isEmptyRecordFilter,
} from 'src/engine/api/common/common-query-runners/utils/is-empty-record-filter.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('isEmptyRecordFilter', () => {
  it.each([
    ['undefined', undefined],
    ['null', null],
    ['empty object', {}],
    ['empty and array', { and: [] }],
    ['empty or array', { or: [] }],
    ['and with only empty sub-filters', { and: [{}, {}] }],
    ['or with only empty sub-filters', { or: [{}] }],
    ['nested empty and/or', { and: [{ or: [] }, {}] }],
    ['malformed and (not an array)', { and: {} }],
  ])('should treat %s as empty (matches all records)', (_label, filter) => {
    expect(isEmptyRecordFilter(filter as never)).toBe(true);
  });

  it.each([
    ['a leaf field condition', { id: { in: ['some-id'] } }],
    ['an eq condition', { name: { eq: 'John' } }],
    ['a not wrapper', { not: { id: { eq: 'some-id' } } }],
    ['and with a real condition', { and: [{ id: { eq: 'some-id' } }] }],
    ['or with at least one real condition', { or: [{}, { id: { eq: 'x' } }] }],
    ['a mix of empty and constraining keys', { and: [], id: { eq: 'x' } }],
  ])('should treat %s as non-empty', (_label, filter) => {
    expect(isEmptyRecordFilter(filter as never)).toBe(false);
  });
});

describe('assertRecordFilterIsNotEmpty', () => {
  it('should throw when the filter is empty', () => {
    expect(() => assertRecordFilterIsNotEmpty({})).toThrow(
      CommonQueryRunnerException,
    );
    expect(() => assertRecordFilterIsNotEmpty({ and: [] })).toThrow(
      'A non-empty filter is required',
    );
  });

  it('should not throw when the filter constrains the result set', () => {
    expect(() =>
      assertRecordFilterIsNotEmpty({ id: { in: ['some-id'] } }),
    ).not.toThrow();
  });
});
