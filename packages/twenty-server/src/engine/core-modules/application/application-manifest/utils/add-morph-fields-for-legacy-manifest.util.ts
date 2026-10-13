import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isMorphRelationHead,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { buildMorphRelationHeadFromTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-morph-relation-head-from-target.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

export const addMorphFieldsForLegacyManifest = ({
  manifestMaps,
  existingMaps,
}: {
  manifestMaps: AllFlatEntityMaps;
  existingMaps: AllFlatEntityMaps;
}): void => {
  const legacyFields = Object.values(
    manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter((field) =>
      isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION),
    )
    .filter(
      (field) =>
        !isDefined(
          manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            field.morphId
          ],
        ),
    );
  for (const field of legacyFields) {
    if (
      isDefined(
        manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[field.morphId],
      )
    ) {
      continue;
    }

    const existingHead =
      existingMaps.flatFieldMetadataMaps.byUniversalIdentifier[field.morphId];
    let head: UniversalFlatFieldMetadata;
    if (isDefined(existingHead)) {
      if (
        !isMorphRelationHead(existingHead) ||
        existingHead.objectMetadataUniversalIdentifier !==
          field.objectMetadataUniversalIdentifier ||
        existingHead.applicationUniversalIdentifier !==
          field.applicationUniversalIdentifier
      ) {
        throw new Error(`Invalid morph field identity ${field.morphId}`);
      }
      head = existingHead;
    } else {
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
      head = buildMorphRelationHeadFromTarget({
        target: field,
        targetObject,
        inverse: isDefined(field.relationTargetFieldMetadataUniversalIdentifier)
          ? (manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[
              field.relationTargetFieldMetadataUniversalIdentifier
            ] ??
            existingMaps.flatFieldMetadataMaps.byUniversalIdentifier[
              field.relationTargetFieldMetadataUniversalIdentifier
            ])
          : undefined,
      });
    }
    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: head,
      universalFlatEntityMapsToMutate: manifestMaps.flatFieldMetadataMaps,
    });
  }
};
