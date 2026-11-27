import { z } from 'zod';

import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';

export const themeColorSchema = z.enum(MAIN_COLOR_NAMES);
