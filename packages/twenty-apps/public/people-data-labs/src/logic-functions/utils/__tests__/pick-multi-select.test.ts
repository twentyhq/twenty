import { describe, expect, it } from 'vitest';

import { pickMultiSelect } from 'src/logic-functions/utils/pick-multi-select';

const LEVELS = new Set(['CXO', 'VP', 'DIRECTOR']);

describe('pickMultiSelect', () => {
  it('keeps allowed values and drops unknown ones', () => {
    expect(
      pickMultiSelect({ rawValues: ['cxo', 'vp', 'unknown'], allowedValues: LEVELS }),
    ).toEqual(['CXO', 'VP']);
  });

  it('dedupes repeated values', () => {
    expect(
      pickMultiSelect({ rawValues: ['cxo', 'cxo'], allowedValues: LEVELS }),
    ).toEqual(['CXO']);
  });

  it('returns undefined for a non-array or when nothing is valid', () => {
    expect(
      pickMultiSelect({ rawValues: 'cxo', allowedValues: LEVELS }),
    ).toBeUndefined();
    expect(
      pickMultiSelect({ rawValues: ['unknown'], allowedValues: LEVELS }),
    ).toBeUndefined();
  });
});
