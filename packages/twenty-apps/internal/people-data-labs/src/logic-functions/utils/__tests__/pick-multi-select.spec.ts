import { describe, expect, it } from 'vitest';

import { pickMultiSelect } from 'src/logic-functions/utils/pick-multi-select';

const LEVELS = new Set(['CXO', 'VP', 'DIRECTOR']);

describe('pickMultiSelect', () => {
  it('keeps allowed values and drops unknown ones', () => {
    expect(pickMultiSelect(['cxo', 'vp', 'unknown'], LEVELS)).toEqual([
      'CXO',
      'VP',
    ]);
  });

  it('dedupes repeated values', () => {
    expect(pickMultiSelect(['cxo', 'cxo'], LEVELS)).toEqual(['CXO']);
  });

  it('returns undefined for a non-array or when nothing is valid', () => {
    expect(pickMultiSelect('cxo', LEVELS)).toBeUndefined();
    expect(pickMultiSelect(['unknown'], LEVELS)).toBeUndefined();
  });
});
