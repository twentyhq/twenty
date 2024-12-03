import { themeColorSchema } from 'twenty-ui';
import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

export const fieldMetadataItemSchema = (existingLabels?: string[]) => {
  return z.object({
    __typename: z.literal('field').optional(),
    createdAt: z.string().datetime(),
    defaultValue: z.any().optional(),
    description: z.string().trim().nullable().optional(),
    icon: z.string().startsWith('Icon').trim().nullable(),
    id: z.string().uuid(),
    isActive: z.boolean(),
    isCustom: z.boolean(),
    isNullable: z.boolean(),
    isUnique: z.boolean(),
    isSystem: z.boolean(),
    label: metadataLabelSchema(existingLabels),
    isLabelSyncedWithName: z.boolean(),
    name: camelCaseStringSchema,
    options: z
      .array(
        z.object({
          color: themeColorSchema,
          id: z.string().uuid(),
          label: z.string().trim().min(1),
          position: z.number(),
          value: z.string().trim().min(1),
        }),
      )
      .nullable()
      .optional(),
    settings: z.any().optional(),
    relationDefinition: z
      .object({
        __typename: z.literal('RelationDefinition').optional(),
        relationId: z.string().uuid(),
        direction: z.nativeEnum(RelationDefinitionType),
        sourceFieldMetadata: z.object({
          __typename: z.literal('field').optional(),
          id: z.string().uuid(),
          name: z.string().trim().min(1),
        }),
        sourceObjectMetadata: z.object({
          __typename: z.literal('object').optional(),
          id: z.string().uuid(),
          namePlural: z.string().trim().min(1),
          nameSingular: z.string().trim().min(1),
        }),
        targetFieldMetadata: z.object({
          __typename: z.literal('field').optional(),
          id: z.string().uuid(),
          name: z.string().trim().min(1),
        }),
        targetObjectMetadata: z.object({
          __typename: z.literal('object').optional(),
          id: z.string().uuid(),
          namePlural: z.string().trim().min(1),
          nameSingular: z.string().trim().min(1),
        }),
      })
      .nullable()
      .optional(),
    type: z.nativeEnum(FieldMetadataType),
    updatedAt: z.string().datetime(),
  }) satisfies z.ZodType<FieldMetadataItem>;
};
