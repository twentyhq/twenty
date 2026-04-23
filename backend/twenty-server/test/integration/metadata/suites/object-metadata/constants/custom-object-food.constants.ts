import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const CUSTOM_OBJECT_FOOD = {
  namePlural: 'foods',
  nameSingular: 'food',
  description: 'My favorite foods',
  labelPlural: 'Foods I love',
  labelSingular: 'food I love',
} as const satisfies Partial<FlatObjectMetadata>;
