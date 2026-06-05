import { describe, expect, it } from 'vitest';

import { pickSelect } from 'src/logic-functions/utils/pick-select';
import { sizeTransform } from 'src/logic-functions/utils/size-transform';

const ROLES = new Set(['ENGINEERING', 'SALES']);
const SIZES = new Set(['ONE_TO_TEN', 'ELEVEN_TO_FIFTY']);

describe('pickSelect', () => {
  it('normalizes and returns an allowed value', () => {
    expect(pickSelect('engineering', ROLES)).toBe('ENGINEERING');
  });

  it('returns undefined for a value outside the option set', () => {
    expect(pickSelect('marketing', ROLES)).toBeUndefined();
  });

  it('returns undefined for empty or non-string input', () => {
    expect(pickSelect('', ROLES)).toBeUndefined();
    expect(pickSelect(undefined, ROLES)).toBeUndefined();
  });

  it('applies a custom transform before checking the option set', () => {
    expect(pickSelect('1-10', SIZES, sizeTransform)).toBe('ONE_TO_TEN');
  });
});
