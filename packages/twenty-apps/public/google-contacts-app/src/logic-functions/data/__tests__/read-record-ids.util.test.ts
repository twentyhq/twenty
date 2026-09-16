import { describe, expect, it } from 'vitest';

import { readRecordIds } from 'src/logic-functions/data/read-record-ids.util';

describe('readRecordIds', () => {
  it('should drop duplicate ids', () => {
    expect(readRecordIds(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('should drop empty ids', () => {
    expect(readRecordIds(['a', '', '  '.trim()])).toEqual(['a']);
  });

  it('should trim the ids it keeps', () => {
    expect(readRecordIds([' a ', 'a'])).toEqual(['a']);
  });

  it('should return nothing when no id is given', () => {
    expect(readRecordIds(undefined)).toEqual([]);
    expect(readRecordIds([])).toEqual([]);
  });

  it('should return nothing for a body that is not a list of ids', () => {
    expect(readRecordIds({ id: 'a' })).toEqual([]);
    expect(readRecordIds('abc')).toEqual([]);
    expect(readRecordIds(42)).toEqual([]);
    expect(readRecordIds(null)).toEqual([]);
  });

  it('should drop the entries of a list that are not ids', () => {
    expect(readRecordIds(['a', 7, null, { id: 'b' }])).toEqual(['a']);
  });
});
