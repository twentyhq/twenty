import { z } from 'zod';

import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';
import { themeColorSchema } from 'twenty-ui/utilities';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

export const fieldMetadataItemSchema = (existingLabels?: string[]) => {
  const relationObjectSchema = z.object({
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
  });

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
    universalIdentifier: z.string(),
    applicationId: z.uuid(),
    isActive: z.boolean(),
    isCustom: z.boolean(),
    isNullable: z.boolean(),
    isUnique: z.boolean(),
    isSystem: z.boolean(),
    isUIReadOnly: z.boolean(),
    label: metadataLabelSchema(existingLabels),
    isLabelSyncedWithName: z.boolean(),
    morphId: z.string().nullable().optional(),
    morphRelations: z.array(relationObjectSchema).nullable().optional(),
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
    relation: relationObjectSchema.nullable().optional(),
    type: z.enum(FieldMetadataType),
    updatedAt: z.iso.datetime(),
  });
};
