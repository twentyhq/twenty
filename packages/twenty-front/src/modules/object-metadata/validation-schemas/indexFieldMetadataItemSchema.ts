import { z } from 'zod';

import { IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';

export const indexFieldMetadataItemSchema = z.object({
  __typename: z.literal('indexField'),
  fieldMetadataId: z.string().uuid(),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  order: z.number(),
}) satisfies z.ZodType<IndexFieldMetadataItem>;
