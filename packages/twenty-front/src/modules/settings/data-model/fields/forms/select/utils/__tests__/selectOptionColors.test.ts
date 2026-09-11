import { TAG_COLORS } from 'twenty-shared/constants';
import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

describe('select option colors', () => {
  it('offers the same colors in the picker as the backend accepts', () => {
    expect(new Set(MAIN_COLOR_NAMES)).toEqual(new Set(TAG_COLORS));
  });
});
