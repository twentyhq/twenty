import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isMorphRelationGroup,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

export const buildIndependentMorphFields = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  standardFlatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  standardFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata[] => {
  const groups = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();
  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(field) ||
      !isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) ||
      isMorphRelationGroup(field)
    ) {
      continue;
    }
    groups.set(field.morphId, [...(groups.get(field.morphId) ?? []), field]);
  }

  return [...groups].flatMap(([morphId, targets]) => {
    if (isDefined(flatFieldMetadataMaps.byUniversalIdentifier[morphId])) {
      return [];
    }

    // Only the upgrade reads the old representative. Runtime metadata belongs to the new field.
    const previousField = pickMorphGroupSurvivorOrThrow(targets);
    assertIsDefinedOrThrow(previousField.relationTargetObjectMetadataId);
    assertIsDefinedOrThrow(previousField.relationTargetFieldMetadataId);
    const targetObject = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: previousField.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const inverse = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: previousField.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });
    const standardField =
      standardFlatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const { joinColumnName: _joinColumnName, ...settings } =
      previousField.settings;
    const { joinColumnName: _universalJoinColumnName, ...universalSettings } =
      previousField.universalSettings;
    const field = standardField ?? previousField;

    return [
      {
        ...field,
        id: v4(),
        universalIdentifier: morphId,
        morphId,
        objectMetadataId: previousField.objectMetadataId,
        objectMetadataUniversalIdentifier:
          previousField.objectMetadataUniversalIdentifier,
        name:
          standardField?.name ??
          getMorphNameFromMorphFieldMetadataName({
            morphRelationFlatFieldMetadata: previousField,
            nameSingular: targetObject.nameSingular,
            namePlural: targetObject.namePlural,
          }),
        overrides: previousField.overrides,
        isSystemSideEffect: false,
        settings: {
          ...settings,
          targetFieldLabel: inverse.label,
          targetFieldName: inverse.name,
          targetFieldIcon: inverse.icon ?? undefined,
        },
        universalSettings: {
          ...universalSettings,
          targetFieldLabel: inverse.label,
          targetFieldName: inverse.name,
          targetFieldIcon: inverse.icon ?? undefined,
        },
        relationTargetFieldMetadataId: null,
        relationTargetObjectMetadataId: null,
        relationTargetFieldMetadataUniversalIdentifier: null,
        relationTargetObjectMetadataUniversalIdentifier: null,
        viewFieldIds: [],
        viewFilterIds: [],
        viewSortIds: [],
        fieldPermissionIds: [],
        viewFieldUniversalIdentifiers: [],
        viewFilterUniversalIdentifiers: [],
        viewSortUniversalIdentifiers: [],
        fieldPermissionUniversalIdentifiers: [],
      },
    ];
  });
};
