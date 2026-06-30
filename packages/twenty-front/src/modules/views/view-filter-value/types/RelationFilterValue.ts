import { type jsonRelationFilterValueSchema } from 'twenty-shared/utils';
import { type z } from 'zod';

export type RelationFilterValue = z.infer<typeof jsonRelationFilterValueSchema>;
