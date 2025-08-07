import { type jsonRelationFilterValueSchema } from '@/views/view-filter-value/validation-schemas/jsonRelationFilterValueSchema';
import { type z } from 'zod';

export type RelationFilterValue = z.infer<typeof jsonRelationFilterValueSchema>;
