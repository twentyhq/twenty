import { z } from 'zod';

import { IndexMetadataItem } from '@/object-metadata/types/IndexMetadataItem';
import { indexFieldMetadataItemSchema } from '@/object-metadata/validation-schemas/indexFieldMetadataItemSchema';
import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { IndexType } from '~/generated-metadata/graphql';

export const indexMetadataItemSchema = z.object({
  __typename: z.literal('Index'),
  id: z.string().uuid(),
  name: z.string(),
  objectMetadataId: z.string().uuid(),
  indexFieldMetadatas: z.array(indexFieldMetadataItemSchema),
  createdAt: z.string().optional(),
  updatedAt: z.string(),
  indexType: z.nativeEnum(IndexType),
  isUnique: z.boolean(),
  objectMetadata: objectMetadataItemSchema,
}) satisfies z.ZodType<IndexMetadataItem>;
