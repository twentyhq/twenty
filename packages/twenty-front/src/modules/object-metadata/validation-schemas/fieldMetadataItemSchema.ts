import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { metadataLabelSchema } from '@/object-metadata/validation-schemas/metadataLabelSchema';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';
import {
  FieldMetadataType,
  RelationDefinitionType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';
import { camelCaseStringSchema } from '~/utils/validation-schemas/camelCaseStringSchema';

export const fieldMetadataItemSchema = z.object({
  __typename: z.literal('field').optional(),
  createdAt: z.string().datetime(),
  defaultValue: z.any().optional(),
  description: z.string().trim().nullable().optional(),
  fromRelationMetadata: z
    .object({
      id: z.string().uuid(),
      relationType: z.nativeEnum(RelationMetadataType),
      toFieldMetadataId: z.string().uuid(),
      toObjectMetadata: z.object({
        id: z.string().uuid(),
        isSystem: z.boolean(),
        namePlural: z.string().trim().min(1),
        nameSingular: z.string().trim().min(1),
      }),
    })
    .nullable()
    .optional(),
  icon: z.string().startsWith('Icon').trim(),
  id: z.string().uuid(),
  label: metadataLabelSchema,
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
    .optional(),
  relationDefinition: z
    .object({
      direction: z.nativeEnum(RelationDefinitionType),
      sourceFieldMetadata: z.object({
        id: z.string().uuid(),
        name: z.string().trim().min(1),
      }),
      sourceObjectMetadata: z.object({
        id: z.string().uuid(),
        namePlural: z.string().trim().min(1),
        nameSingular: z.string().trim().min(1),
      }),
      targetFieldMetadata: z.object({
        id: z.string().uuid(),
        name: z.string().trim().min(1),
      }),
      targetObjectMetadata: z.object({
        id: z.string().uuid(),
        namePlural: z.string().trim().min(1),
        nameSingular: z.string().trim().min(1),
      }),
    })
    .nullable()
    .optional(),
  toRelationMetadata: z
    .object({
      id: z.string().uuid(),
      relationType: z.nativeEnum(RelationMetadataType),
      fromFieldMetadataId: z.string().uuid(),
      fromObjectMetadata: z.object({
        id: z.string().uuid(),
        isSystem: z.boolean(),
        namePlural: z.string().trim().min(1),
        nameSingular: z.string().trim().min(1),
      }),
    })
    .nullable()
    .optional(),
  type: z.nativeEnum(FieldMetadataType),
  updatedAt: z.string().datetime(),
}) satisfies z.ZodType<FieldMetadataItem>;
