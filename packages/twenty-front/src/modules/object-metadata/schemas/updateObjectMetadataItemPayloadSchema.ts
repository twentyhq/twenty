import camelCase from 'lodash.camelcase';
import { z, ZodTypeDef } from 'zod';

import { objectMetadataItemSchema } from '@/object-metadata/schemas/objectMetadataItemSchema';
import { UpdateObjectInput } from '~/generated-metadata/graphql';

type Input = Omit<UpdateObjectInput, 'nameSingular' | 'namePlural'>;
type Output = UpdateObjectInput;

export const updateObjectMetadataItemPayloadSchema: z.ZodType<
  Output,
  ZodTypeDef,
  Input
> = objectMetadataItemSchema
  .pick<Record<keyof Input, true>>({
    description: true,
    icon: true,
    imageIdentifierFieldMetadataId: true,
    isActive: true,
    labelIdentifierFieldMetadataId: true,
    labelPlural: true,
    labelSingular: true,
  })
  .partial()
  .transform((value) => ({
    ...value,
    nameSingular: value.labelSingular
      ? camelCase(value.labelSingular)
      : undefined,
    namePlural: value.labelPlural ? camelCase(value.labelPlural) : undefined,
  }));
