import { relationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/relationFilterValueSchema';
import { z } from 'zod';

export type RelationFilterValue = z.infer<typeof relationFilterValueSchema>;
