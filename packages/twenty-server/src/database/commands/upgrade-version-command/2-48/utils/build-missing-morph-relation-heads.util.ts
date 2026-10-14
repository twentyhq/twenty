import omit from 'lodash.omit';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  capitalize,
  isDefined,
  isMorphRelationHead,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { searchAndReplaceLast } from 'src/engine/metadata-modules/flat-object-metadata/utils/search-and-replace-last.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { resetUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';

type MorphRelationTarget = FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export type SkippedMorphRelationHead = {
  morphId: string;
  reason: string;
};

const FLAT_FIELD_METADATA_ID_PROPERTIES = [
  'id',
  'objectMetadataId',
  'applicationId',
  'workspaceId',
  'relationTargetFieldMetadataId',
  'relationTargetObjectMetadataId',
  'kanbanAggregateOperationViewIds',
  'calendarViewIds',
  'calendarEndViewIds',
  'mainGroupByFieldMetadataViewIds',
  'viewFieldIds',
  'viewFilterIds',
  'viewSortIds',
  'fieldPermissionIds',
  'searchFieldMetadataIds',
] as const;

const computeMorphName = ({
  target,
  targetObject,
}: {
  target: MorphRelationTarget;
  targetObject: FlatObjectMetadata;
}) =>
  searchAndReplaceLast({
    source: target.name,
    replace: '',
    search: capitalize(
      target.universalSettings.relationType === RelationType.MANY_TO_ONE
        ? targetObject.nameSingular
        : targetObject.namePlural,
    ),
  });

// Same shape as the head the engine creates with a new morph field.
const buildHeadFromTarget = ({
  target,
  name,
}: {
  target: MorphRelationTarget;
  name: string;
}): UniversalFlatFieldMetadata => ({
  ...resetUniversalFlatEntityForeignKeyAggregators({
    universalFlatEntity: omit(
      target,
      FLAT_FIELD_METADATA_ID_PROPERTIES,
    ) as UniversalFlatFieldMetadata,
    metadataName: 'fieldMetadata',
  }),
  universalIdentifier: target.morphId,
  name,
  isSystemSideEffect: true,
  universalSettings: omit(target.universalSettings, 'joinColumnName'),
  relationTargetFieldMetadataUniversalIdentifier: null,
  relationTargetObjectMetadataUniversalIdentifier: null,
});

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

    // The target reads show while the head flag is off, so the head keeps
    // the label and settings users see today.
    const target = pickMorphGroupSurvivorOrThrow(targets);

    const standardHead =
      standardFlatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const targetObject = isDefined(
      target.relationTargetObjectMetadataUniversalIdentifier,
    )
      ? flatObjectMetadataMaps.byUniversalIdentifier[
          target.relationTargetObjectMetadataUniversalIdentifier
        ]
      : undefined;

    const head =
      standardHead ??
      (isDefined(targetObject)
        ? buildHeadFromTarget({
            target,
            name: computeMorphName({ target, targetObject }),
          })
        : undefined);

    if (!isDefined(head)) {
      skipped.push({ morphId, reason: 'target object not found' });
      continue;
    }

    const headNameKey = `${target.objectMetadataUniversalIdentifier}:${head.name}`;
    const isNameTaken =
      headNamesByObject.has(headNameKey) ||
      (
      flatObjectMetadataMaps.byUniversalIdentifier[
        target.objectMetadataUniversalIdentifier
      ]?.fieldUniversalIdentifiers ?? []
    ).some(
      (fieldUniversalIdentifier) =>
        flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier]
          ?.name === head.name,
      );

    if (isNameTaken) {
      skipped.push({
        morphId,
        reason: `name "${head.name}" is taken on its object`,
      });
      continue;
    }

    headNamesByObject.add(headNameKey);
    heads.push(head);
  }

  return { heads, skipped };
};
