import { z } from 'zod';

import { IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';

export const indexFieldMetadataItemSchema = z.object({
  __typename: z.literal('IndexField'),
  fieldMetadataId: z.string().uuid(),
  sortOrder: z.enum(['ASC', 'DESC']),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  indexMetadataId: z.string(),
  order: z.number(),
}) satisfies z.ZodType<IndexFieldMetadataItem>;
