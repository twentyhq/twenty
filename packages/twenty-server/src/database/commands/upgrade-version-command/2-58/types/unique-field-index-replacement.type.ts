import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type UniqueFieldIndexReplacement = {
  legacyFlatIndexMetadata: FlatIndexMetadata;
  legacyApplicationUniversalIdentifier: string;
  replacementFlatIndexMetadata: UniversalFlatIndexMetadata;
  isReplacementAlreadyCreated: boolean;
  flatObjectMetadata: FlatObjectMetadata;
};
