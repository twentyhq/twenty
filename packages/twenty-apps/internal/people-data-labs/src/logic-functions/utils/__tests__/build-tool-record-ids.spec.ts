import { describe, expect, it } from 'vitest';

import { buildToolRecordIds } from 'src/logic-functions/utils/build-tool-record-ids';

describe('buildToolRecordIds', () => {
  it('accepts a single recordId', () => {
    expect(buildToolRecordIds({ recordId: 'a' })).toEqual(['a']);
  });

  it('accepts multiple recordIds', () => {
    expect(buildToolRecordIds({ recordIds: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it('merges recordId and recordIds, deduping overlaps', () => {
    expect(
      buildToolRecordIds({ recordId: 'a', recordIds: ['b', 'a'] }),
    ).toEqual(['b', 'a']);
  });

  it('returns an empty array when neither is provided', () => {
    expect(buildToolRecordIds({})).toEqual([]);
  });
});
