import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

import { themeColorSchema } from '~/utils/validation-schemas/themeColorSchema';

describe('themeColorSchema', () => {
  it.each(MAIN_COLOR_NAMES)('accepts the canonical color %s', (color) => {
    expect(themeColorSchema.safeParse(color)).toEqual({
      success: true,
      data: color,
    });
  });

  it.each(['', 'invalid', 'Blue', ' blue ', 'blue9', 42])(
    'rejects invalid color %j',
    (color) => {
      expect(themeColorSchema.safeParse(color).success).toBe(false);
    },
  );

  it.each([null, undefined])('rejects %s', (color) => {
    expect(themeColorSchema.safeParse(color).success).toBe(false);
  });
});
