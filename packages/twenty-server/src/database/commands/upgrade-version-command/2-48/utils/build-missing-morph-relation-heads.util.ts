import omit from 'lodash.omit';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isMorphRelationHead,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildMorphRelationHeadFromTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-morph-relation-head-from-target.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { validateFlatFieldMetadataName } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name.util';
import { validateFlatFieldMetadataNameAvailability } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-flat-field-metadata-name-availability.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type MorphRelationTarget = FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export type SkippedMorphRelationHead = {
  morphId: string;
  reason: string;
};

const pickTargetShownByReads = (
  targets: MorphRelationTarget[],
): MorphRelationTarget => {
  const { id } = pickMorphGroupSurvivorOrThrow(
    targets.map((target) =>
      resolveEffectiveFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: target,
      }),
    ),
  );

  const target = targets.find((candidate) => candidate.id === id);

  assertIsDefinedOrThrow(target);

  return target;
};

export const buildMissingMorphRelationHeads = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  standardFlatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  standardFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  heads: UniversalFlatFieldMetadata[];
  skipped: SkippedMorphRelationHead[];
} => {
  const targetsByMorphId = new Map<string, MorphRelationTarget[]>();

  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(field) ||
      !isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) ||
      isMorphRelationHead(field)
    ) {
      continue;
    }

    targetsByMorphId.set(field.morphId, [
      ...(targetsByMorphId.get(field.morphId) ?? []),
      field,
    ]);
  }

  const heads: UniversalFlatFieldMetadata[] = [];
  const headNamesByObject = new Set<string>();
  const skipped: SkippedMorphRelationHead[] = [];

  for (const [morphId, targets] of targetsByMorphId) {
    if (isDefined(flatFieldMetadataMaps.byUniversalIdentifier[morphId])) {
      continue;
    }

    const objectUniversalIdentifiers = new Set(
      targets.map((target) => target.objectMetadataUniversalIdentifier),
    );

    if (objectUniversalIdentifiers.size > 1) {
      skipped.push({
        morphId,
        reason: `targets span ${objectUniversalIdentifiers.size} objects`,
      });
      continue;
    }

    const target = pickTargetShownByReads(targets);
    const object =
      flatObjectMetadataMaps.byUniversalIdentifier[
        target.objectMetadataUniversalIdentifier
      ];
    const targetObject = isDefined(
      target.relationTargetObjectMetadataUniversalIdentifier,
    )
      ? flatObjectMetadataMaps.byUniversalIdentifier[
          target.relationTargetObjectMetadataUniversalIdentifier
        ]
      : undefined;

    const standardHead =
      standardFlatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const head: UniversalFlatFieldMetadata | undefined = isDefined(
      standardHead,
    )
      ? {
          ...standardHead,
          isActive: target.isActive,
          overrides: target.overrides,
        }
      : isDefined(targetObject)
        ? omit(buildMorphRelationHeadFromTarget({ target, targetObject }), 'id')
        : undefined;

    if (!isDefined(head) || !isDefined(object)) {
      skipped.push({ morphId, reason: 'object or target object not found' });
      continue;
    }

    const headNameKey = `${object.universalIdentifier}:${head.name}`;
    const buildOptions = {
      isSystemBuild: true,
      applicationUniversalIdentifier: head.applicationUniversalIdentifier,
    };
    const isNameTaken =
      headNamesByObject.has(headNameKey) ||
      validateFlatFieldMetadataName({ name: head.name, buildOptions }).length >
        0 ||
      validateFlatFieldMetadataNameAvailability({
        name: head.name,
        universalFlatFieldMetadataMaps: flatFieldMetadataMaps,
        universalFlatObjectMetadata: object,
        buildOptions,
      }).length > 0;

    if (isNameTaken) {
      skipped.push({
        morphId,
        reason: `name "${head.name}" is not available on its object`,
      });
      continue;
    }

    headNamesByObject.add(headNameKey);
    heads.push(head);
  }

  return { heads, skipped };
};
