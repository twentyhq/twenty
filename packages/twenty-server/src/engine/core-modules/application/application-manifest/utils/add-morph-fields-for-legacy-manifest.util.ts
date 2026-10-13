import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isMorphRelationHead,
} from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildMorphRelationHeadFromTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-morph-relation-head-from-target.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

type MapsArgs = {
  manifestMaps: AllFlatEntityMaps;
  existingMaps: AllFlatEntityMaps;
};

const resolveExistingHead = ({
  existingHead,
  target,
}: {
  existingHead: FlatFieldMetadata;
  target: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
}): FlatFieldMetadata => {
  if (
    !isMorphRelationHead(existingHead) ||
    existingHead.objectMetadataUniversalIdentifier !==
      target.objectMetadataUniversalIdentifier ||
    existingHead.applicationUniversalIdentifier !==
      target.applicationUniversalIdentifier
  ) {
    throw new ApplicationException(
      `Invalid morph relation head ${target.morphId}`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  return {
    ...existingHead,
    label: target.label,
    description: target.description,
    icon: target.icon,
  };
};

const buildHeadFromManifestTarget = ({
  target,
  manifestMaps,
  existingMaps,
}: MapsArgs & {
  target: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
}): FlatFieldMetadata => {
  assertIsDefinedOrThrow(
    target.relationTargetObjectMetadataUniversalIdentifier,
  );

  const targetObject =
    manifestMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      target.relationTargetObjectMetadataUniversalIdentifier
    ] ??
    existingMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      target.relationTargetObjectMetadataUniversalIdentifier
    ];

  assertIsDefinedOrThrow(targetObject);

  const inverseUniversalIdentifier =
    target.relationTargetFieldMetadataUniversalIdentifier;

  return buildMorphRelationHeadFromTarget({
    target,
    targetObject,
    inverse: isDefined(inverseUniversalIdentifier)
      ? (manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          inverseUniversalIdentifier
        ] ??
        existingMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          inverseUniversalIdentifier
        ])
      : undefined,
  });
};

export const addMorphFieldsForLegacyManifest = ({
  manifestMaps,
  existingMaps,
}: MapsArgs): void => {
  const legacyTargets = Object.values(
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

  for (const target of legacyTargets) {
    if (
      isDefined(
        manifestMaps.flatFieldMetadataMaps.byUniversalIdentifier[
          target.morphId
        ],
      )
    ) {
      continue;
    }

    const existingHead =
      existingMaps.flatFieldMetadataMaps.byUniversalIdentifier[target.morphId];

    const head = isDefined(existingHead)
      ? resolveExistingHead({ existingHead, target })
      : buildHeadFromManifestTarget({ target, manifestMaps, existingMaps });

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: head,
      universalFlatEntityMapsToMutate: manifestMaps.flatFieldMetadataMaps,
    });
  }
};
