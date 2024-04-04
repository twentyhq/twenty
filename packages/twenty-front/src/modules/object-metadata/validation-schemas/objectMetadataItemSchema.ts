import { z } from 'zod';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

export const objectMetadataItemSchema = z.object({
  __typename: z.literal('object').optional(),
  createdAt: z.string().datetime(),
  dataSourceId: z.string().uuid(),
  description: z.string().trim().nullable().optional(),
  fields: z.array(fieldMetadataItemSchema),
  icon: z.string().startsWith('Icon').trim(),
  id: z.string().uuid(),
  imageIdentifierFieldMetadataId: z.string().uuid().nullable(),
  isActive: z.boolean(),
  isCustom: z.boolean(),
  isRemote: z.boolean(),
  isSystem: z.boolean(),
  labelIdentifierFieldMetadataId: z.string().uuid().nullable(),
  labelPlural: z.string().trim().min(1),
  labelSingular: z.string().trim().min(1),
  namePlural: camelCaseStringSchema,
  nameSingular: camelCaseStringSchema,
  updatedAt: z.string().datetime(),
}) satisfies z.ZodType<ObjectMetadataItem>;
