import { describe, expect, it } from 'vitest';

import { extractRecordIds } from 'src/logic-functions/utils/extract-record-ids';

describe('extractRecordIds', () => {
  it('extracts ids from record objects', () => {
    expect(extractRecordIds([{ id: 'a' }, { id: 'b' }])).toEqual(['a', 'b']);
  });

  it('accepts plain id strings', () => {
    expect(extractRecordIds(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('drops entries without a usable id', () => {
    expect(
      extractRecordIds([{ id: 'a' }, { id: null }, {}, { id: '' }, 'c']),
    ).toEqual(['a', 'c']);
  });

  it('accepts a single record object (not wrapped in an array)', () => {
    expect(extractRecordIds({ id: 'a' })).toEqual(['a']);
  });

  it('accepts a single id string (not wrapped in an array)', () => {
    expect(extractRecordIds('a')).toEqual(['a']);
  });

  it('returns an empty array for nullish input', () => {
    expect(extractRecordIds(undefined as unknown as [])).toEqual([]);
    expect(extractRecordIds(null as unknown as [])).toEqual([]);
  });
});
