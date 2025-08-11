import { z } from 'zod';

import { type IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';

export const indexFieldMetadataItemSchema = z.object({
  __typename: z.literal('IndexField'),
  fieldMetadataId: z.string().uuid(),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.number(),
}) satisfies z.ZodType<IndexFieldMetadataItem>;
