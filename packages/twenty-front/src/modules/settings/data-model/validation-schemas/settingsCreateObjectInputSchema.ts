import camelCase from 'lodash.camelcase';

import { objectMetadataItemSchema } from '@/object-metadata/validation-schemas/objectMetadataItemSchema';
import { CreateObjectInput } from '~/generated-metadata/graphql';

export const settingsCreateObjectInputSchema = objectMetadataItemSchema
  .pick({
    description: true,
    icon: true,
    labelPlural: true,
    labelSingular: true,
  })
  .transform<CreateObjectInput>((value) => ({
    ...value,
    nameSingular: camelCase(value.labelSingular),
    namePlural: camelCase(value.labelPlural),
  }));
