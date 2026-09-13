import { describe, expect, it } from 'vitest';

import { readRecordIds } from 'src/logic-functions/data/read-record-ids.util';

describe('readRecordIds', () => {
  it('should drop duplicate ids', () => {
    expect(readRecordIds(['a', 'b', 'a'])).toEqual(['a', 'b']);
  });

  it('should drop empty ids', () => {
    expect(readRecordIds(['a', '', '  '.trim()])).toEqual(['a']);
  });

  it('should return nothing when no id is given', () => {
    expect(readRecordIds(undefined)).toEqual([]);
    expect(readRecordIds([])).toEqual([]);
  });
});
