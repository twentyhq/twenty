import { z } from 'zod';

import { type IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { indexFieldMetadataItemSchema } from '@/object-metadata/validation-schemas/indexFieldMetadataItemSchema';
import { IndexType } from '~/generated/graphql';

export const indexMetadataItemSchema = z.object({
  __typename: z.literal('Index'),
  id: z.uuid(),
  name: z.string(),
  indexFieldMetadatas: z.array(indexFieldMetadataItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  indexType: z.enum(IndexType),
  indexWhereClause: z.string().nullable(),
  isUnique: z.boolean(),
  objectMetadata: z.any(),
}) satisfies z.ZodType<IndexMetadataItem>;
