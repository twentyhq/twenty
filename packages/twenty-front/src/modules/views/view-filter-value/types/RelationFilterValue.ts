import { jsonRelationFilterValueSchema } from 'twenty-shared/types';
import { z } from 'zod';

export type RelationFilterValue = z.infer<typeof jsonRelationFilterValueSchema>;
