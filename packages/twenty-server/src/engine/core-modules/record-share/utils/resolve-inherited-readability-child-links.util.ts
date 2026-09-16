/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type InheritedReadabilityParentLink } from 'src/engine/core-modules/record-share/types/inherited-readability-parent-link.type';
import { getRelationFlatFieldMetadatasOfObject } from 'src/engine/twenty-orm/utils/get-relation-flat-field-metadatas-of-object.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

// The records of other objects that inherit their readability through the rows
// of this object: writing such a row grants access to the record it points at
export const resolveInheritedReadabilityChildLinks = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): InheritedReadabilityParentLink[] =>
  getRelationFlatFieldMetadatasOfObject({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })
    .filter(isManyToOneFlatFieldMetadata)
    .flatMap((flatFieldMetadata) => {
      const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      });
      const parentFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
      });

      if (
        !isDefined(parentFlatObjectMetadata) ||
        !isDefined(parentFlatFieldMetadata) ||
        parentFlatObjectMetadata.readability !==
          MetadataReadability.INHERITED ||
        !(
          parentFlatObjectMetadata.readabilityParentFieldUniversalIdentifiers ??
          []
        ).includes(parentFlatFieldMetadata.universalIdentifier)
      ) {
        return [];
      }

      return [
        {
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: flatFieldMetadata.name,
          }),
          parentFlatObjectMetadata,
        },
      ];
    });
