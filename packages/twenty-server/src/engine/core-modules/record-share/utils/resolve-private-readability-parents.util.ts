/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { type InheritedReadabilityColumnParent } from 'src/engine/core-modules/record-share/types/inherited-readability-column-parent.type';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// INHERITED readability is not enforced, except that a record linking to a
// PRIVATE record must not expose it: only its many-to-one parents count
export const resolvePrivateReadabilityParents = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityColumnParent[] => {
  if (flatObjectMetadata.readability !== MetadataReadability.INHERITED) {
    return [];
  }

  return resolveInheritedReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  }).flatMap((parent) =>
    parent.kind === 'column' &&
    parent.parentFlatObjectMetadata.readability === MetadataReadability.PRIVATE
      ? [parent]
      : [],
  );
};
