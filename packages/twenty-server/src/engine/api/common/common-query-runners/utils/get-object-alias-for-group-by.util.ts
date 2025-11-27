import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getObjectAlias = (
  flatObjectMetadata: FlatObjectMetadata,
): string => {
  return flatObjectMetadata.nameSingular;
};
