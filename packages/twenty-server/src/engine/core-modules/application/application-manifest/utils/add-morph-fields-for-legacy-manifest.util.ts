import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isMorphRelationGroup,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const addMorphFieldsForLegacyManifest = ({
  manifestMaps,
  existingMaps,
}: {
  manifestMaps: AllFlatEntityMaps;
  existingMaps: AllFlatEntityMaps;
}): void => {
  for (const field of Object.values(
    manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(field) ||
      !isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) ||
      isDefined(
        manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[field.morphId],
      )
    )
      continue;

    const existingGroup =
      existingMaps.flatFieldMetadataMaps.byUniversalIdentifier[field.morphId];
    let group: UniversalFlatFieldMetadata;
    if (isDefined(existingGroup)) {
      if (
        !isMorphRelationGroup(existingGroup) ||
        existingGroup.objectMetadataUniversalIdentifier !==
          field.objectMetadataUniversalIdentifier ||
        existingGroup.applicationUniversalIdentifier !==
          field.applicationUniversalIdentifier
      ) {
        throw new Error(`Invalid morph field identity ${field.morphId}`);
      }
      group = existingGroup;
    } else {
      // Older SDKs only describe targets. Materialize their owner once at import;
      // later imports keep the persisted field, even if the original target is gone.
      assertIsDefinedOrThrow(
        field.relationTargetObjectMetadataUniversalIdentifier,
      );
      const targetObject =
        manifestMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          field.relationTargetObjectMetadataUniversalIdentifier
        ] ??
        existingMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          field.relationTargetObjectMetadataUniversalIdentifier
        ];
      assertIsDefinedOrThrow(targetObject);
      const inverse = isDefined(
        field.relationTargetFieldMetadataUniversalIdentifier,
      )
        ? (manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            field.relationTargetFieldMetadataUniversalIdentifier
          ] ??
          existingMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            field.relationTargetFieldMetadataUniversalIdentifier
          ])
        : undefined;
      const { joinColumnName: _joinColumnName, ...settings } =
        field.universalSettings;
      group = {
        ...field,
        universalIdentifier: field.morphId,
        name: getMorphNameFromMorphFieldMetadataName({
          morphRelationFlatFieldMetadata: field,
          nameSingular: targetObject.nameSingular,
          namePlural: targetObject.namePlural,
        }),
        relationTargetFieldMetadataUniversalIdentifier: null,
        relationTargetObjectMetadataUniversalIdentifier: null,
        universalSettings: {
          ...settings,
          targetFieldLabel: inverse?.label,
          targetFieldName: inverse?.name,
          targetFieldIcon: inverse?.icon ?? undefined,
        },
      };
    }
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: group,
      universalFlatEntityMapsToMutate: manifestMaps.flatFieldMetadataMaps,
    });
  }
};
