import camelCase from 'lodash.camelcase';

import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { UpdateObjectInput } from '~/generated-metadata/graphql';

export const settingsUpdateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    imageIdentifierFieldMetadataId: true,
    isActive: true,
    labelIdentifierFieldMetadataId: true,
    labelPlural: true,
    labelSingular: true,
  })
  .partial()
  .transform<UpdateObjectInput>((value) => ({
    ...value,
    nameSingular: value.labelSingular
      ? camelCase(value.labelSingular)
      : undefined,
    namePlural: value.labelPlural ? camelCase(value.labelPlural) : undefined,
  }));
