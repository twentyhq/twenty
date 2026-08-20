import { describe, expect, it } from 'vitest';

import { sizeTransform } from 'src/logic-functions/utils/size-transform';

describe('sizeTransform', () => {
  it('maps PDL size ranges to option values', () => {
    expect(sizeTransform('1-10')).toBe('ONE_TO_TEN');
    expect(sizeTransform('10001+')).toBe('TEN_THOUSAND_ONE_PLUS');
  });

  it('tolerates spacing variants', () => {
    expect(sizeTransform('51 - 200')).toBe('FIFTY_ONE_TO_TWO_HUNDRED');
  });

  it('returns undefined for an unknown range', () => {
    expect(sizeTransform('weird')).toBeUndefined();
  });
});
