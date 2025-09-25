import { z } from 'zod';

import { fieldMetadataItemSchema } from '@/object-metadata/validation-schemas/fieldMetadataItemSchema';
import { indexMetadataItemSchema } from '@/object-metadata/validation-schemas/indexMetadataItemSchema';
import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

export const objectMetadataItemSchema = z.object({
  __typename: z.literal('Object').optional(),
  createdAt: z.iso.datetime(),
  description: z.string().trim().nullable().optional(),
  fields: z.array(fieldMetadataItemSchema()),
  readableFields: z.array(fieldMetadataItemSchema()),
  updatableFields: z.array(fieldMetadataItemSchema()),
  indexMetadatas: z.array(indexMetadataItemSchema),
  icon: z.string().startsWith('Icon').trim(),
  id: z.uuid(),
  duplicateCriteria: z.array(z.array(z.string())),
  imageIdentifierFieldMetadataId: z.uuid().nullable(),
  isActive: z.boolean(),
  isCustom: z.boolean(),
  isRemote: z.boolean(),
  isSystem: z.boolean(),
  isUIReadOnly: z.boolean(),
  isSearchable: z.boolean(),
  labelIdentifierFieldMetadataId: z.uuid(),
  labelPlural: metadataLabelSchema(),
  labelSingular: metadataLabelSchema(),
  namePlural: camelCaseStringSchema,
  nameSingular: camelCaseStringSchema,
  updatedAt: z.iso.datetime(),
  shortcut: z.string().nullable().optional(),
  isLabelSyncedWithName: z.boolean(),
});
