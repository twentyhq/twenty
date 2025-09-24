import { z } from 'zod';

import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';
import { themeColorSchema } from 'twenty-ui/theme';
import { FieldMetadataType, RelationType } from '~/generated/graphql';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

export const fieldMetadataItemSchema = (existingLabels?: string[]) => {
  return z.object({
    __typename: z.literal('Field').optional(),
    createdAt: z.iso.datetime(),
    defaultValue: z.any().optional(),
    description: z.string().trim().nullable().optional(),
    icon: z
      .union([z.string().startsWith('Icon').trim(), z.literal('')])
      .nullable()
      .optional(),
    id: z.uuid(),
    isActive: z.boolean(),
    isCustom: z.boolean(),
    isNullable: z.boolean(),
    isUnique: z.boolean(),
    isSystem: z.boolean(),
    isUIReadOnly: z.boolean(),
    label: metadataLabelSchema(existingLabels),
    isLabelSyncedWithName: z.boolean(),
    name: camelCaseStringSchema,
    options: z
      .array(
        z.object({
          color: themeColorSchema,
          id: z.uuid(),
          label: z.string().trim().min(1),
          position: z.number(),
          value: z.string().trim().min(1),
        }),
      )
      .nullable()
      .optional(),
    settings: z.any().optional(),
    relation: z
      .object({
        __typename: z.literal('Relation').optional(),
        type: z.enum(RelationType),
        sourceFieldMetadata: z.object({
          __typename: z.literal('Field').optional(),
          id: z.uuid(),
          name: z.string().trim().min(1),
        }),
        sourceObjectMetadata: z.object({
          __typename: z.literal('Object').optional(),
          id: z.uuid(),
          namePlural: z.string().trim().min(1),
          nameSingular: z.string().trim().min(1),
        }),
        targetFieldMetadata: z.object({
          __typename: z.literal('Field').optional(),
          id: z.uuid(),
          name: z.string().trim().min(1),
        }),
        targetObjectMetadata: z.object({
          __typename: z.literal('Object').optional(),
          id: z.uuid(),
          namePlural: z.string().trim().min(1),
          nameSingular: z.string().trim().min(1),
        }),
      })
      .nullable()
      .optional(),
    type: z.enum(FieldMetadataType),
    updatedAt: z.iso.datetime(),
  });
};
