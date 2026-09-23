import { MAIN_COLOR_NAMES } from 'twenty-ui/theme';
import { z } from 'zod';

export const themeColorSchema = z.enum(MAIN_COLOR_NAMES);
