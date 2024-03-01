import camelCase from 'lodash.camelcase';
import { z, ZodTypeDef } from 'zod';

import { objectMetadataItemSchema } from '@/object-metadata/schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';

type Input = Omit<
  CreateObjectInput,
  | 'imageIdentifierFieldMetadataId'
  | 'labelIdentifierFieldMetadataId'
  | 'namePlural'
  | 'nameSingular'
>;
type Output = CreateObjectInput;

export const createObjectMetadataItemPayloadSchema: z.ZodType<
  Output,
  ZodTypeDef,
  Input
> = objectMetadataItemSchema
  .pick<Record<keyof Input, true>>({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform((value) => ({
    ...value,
    nameSingular: camelCase(value.labelSingular),
    namePlural: camelCase(value.labelPlural),
  }));
