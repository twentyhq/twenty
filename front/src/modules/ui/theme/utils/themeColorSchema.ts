import { z } from 'zod';

import { mainColorNames, ThemeColor } from '../constants/colors';

export const themeColorSchema = z.enum(
  mainColorNames as [ThemeColor, ...ThemeColor[]],
);
