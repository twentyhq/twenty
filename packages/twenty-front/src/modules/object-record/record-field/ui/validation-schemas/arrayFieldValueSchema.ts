import { z } from 'zod';

export const arrayFieldValueSchema = z.union([z.null(), z.array(z.string())]);
