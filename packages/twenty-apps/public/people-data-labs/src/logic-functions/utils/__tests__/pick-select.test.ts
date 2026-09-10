import { describe, expect, it } from 'vitest';

import { pickSelect } from 'src/logic-functions/utils/pick-select';
import { sizeTransform } from 'src/logic-functions/utils/size-transform';

const ROLES = new Set(['ENGINEERING', 'SALES']);
const SIZES = new Set(['ONE_TO_TEN', 'ELEVEN_TO_FIFTY']);

describe('pickSelect', () => {
  it('normalizes and returns an allowed value', () => {
    expect(pickSelect({ raw: 'engineering', allowedValues: ROLES })).toBe(
      'ENGINEERING',
    );
  });

  it('returns undefined for a value outside the option set', () => {
    expect(
      pickSelect({ raw: 'marketing', allowedValues: ROLES }),
    ).toBeUndefined();
  });

  it('returns undefined for empty or non-string input', () => {
    expect(pickSelect({ raw: '', allowedValues: ROLES })).toBeUndefined();
    expect(
      pickSelect({ raw: undefined, allowedValues: ROLES }),
    ).toBeUndefined();
  });

  it('applies a custom transform before checking the option set', () => {
    expect(
      pickSelect({
        raw: '1-10',
        allowedValues: SIZES,
        transform: sizeTransform,
      }),
    ).toBe('ONE_TO_TEN');
  });
});
