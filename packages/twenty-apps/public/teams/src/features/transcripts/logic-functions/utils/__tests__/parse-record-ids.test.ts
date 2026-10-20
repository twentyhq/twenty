import { describe, expect, it } from 'vitest';

import { parseRecordIds } from 'src/features/transcripts/logic-functions/utils/parse-record-ids';

describe('parseRecordIds', () => {
  it('should keep each non-empty string id once', () => {
    expect(parseRecordIds(['id-1', '', 'id-2', 42, null, 'id-1'])).toEqual([
      'id-1',
      'id-2',
    ]);
  });

  it('should return no ids when the value is not an array', () => {
    expect(parseRecordIds(undefined)).toEqual([]);
    expect(parseRecordIds('id-1')).toEqual([]);
    expect(parseRecordIds({ id: 'id-1' })).toEqual([]);
  });
});
