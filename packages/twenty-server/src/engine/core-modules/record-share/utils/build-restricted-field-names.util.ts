import {
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const buildRestrictedFieldNames = ({
  restrictedFields,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> => {
  const restrictedFieldNames = new Set<string>();

  for (const [fieldMetadataId, permissions] of Object.entries(
    restrictedFields,
  )) {
    if (permissions.canRead !== false) {
      continue;
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    restrictedFieldNames.add(flatFieldMetadata.name);

    if (
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
    ) {
      continue;
    }

    // The owning side of a relation also travels as its join column: the record
    // snapshots carry the ORM spelling, which settings can rename, while
    // computeUpdatedFieldsFromDiff always appends <name>Id.
    restrictedFieldNames.add(
      getJoinColumnNameForRelationField(flatFieldMetadata),
    );
    restrictedFieldNames.add(
      computeMorphOrRelationFieldJoinColumnName({
        name: flatFieldMetadata.name,
      }),
    );
  }

  return restrictedFieldNames;
};
