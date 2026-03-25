import { type urlSingleFilterSchema } from '@/views/schemas/urlSingleFilterSchema';
import { type z } from 'zod';

export type UrlSingleFilter = z.infer<typeof urlSingleFilterSchema>;
