import { z } from 'zod';

import { type SearchFieldMetadataItem } from '@/object-metadata/types/SearchFieldMetadataItem';

export const searchFieldMetadataItemSchema = z.object({
  __typename: z.literal('SearchField').optional(),
  id: z.uuid(),
  fieldMetadataId: z.uuid(),
  tsVectorFieldMetadataId: z.uuid(),
  position: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<SearchFieldMetadataItem>;
