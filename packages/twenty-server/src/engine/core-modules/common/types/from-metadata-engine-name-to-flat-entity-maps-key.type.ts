import { type AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';

export type FromMetadataEngineNameToFlatEntityMapsKey<
  P extends keyof AllFlatEntitiesByMetadataEngineName,
> = `flat${Capitalize<P>}Maps`;
