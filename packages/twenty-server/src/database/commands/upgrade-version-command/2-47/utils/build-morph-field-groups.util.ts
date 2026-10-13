import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationGroup,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isRelationFieldMetadataWithTarget } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-field-metadata-with-target.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

export type SkippedMorphFieldGroup = {
  morphId: string;
  reason: string;
};

export const buildMorphFieldGroups = ({
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  standardFlatFieldMetadataMaps,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  standardFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  groupsToCreate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  skippedGroups: SkippedMorphFieldGroup[];
} => {
  const allFlatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const targetsByMorphId = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();

  for (const flatFieldMetadata of allFlatFieldMetadatas) {
    if (
      !isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      ) ||
      isMorphRelationGroup(flatFieldMetadata)
    ) {
      continue;
    }

    targetsByMorphId.set(flatFieldMetadata.morphId, [
      ...(targetsByMorphId.get(flatFieldMetadata.morphId) ?? []),
      flatFieldMetadata,
    ]);
  }

  const fieldNamesByObjectId = new Map<string, Set<string>>();

  for (const flatFieldMetadata of allFlatFieldMetadatas) {
    const fieldNames =
      fieldNamesByObjectId.get(flatFieldMetadata.objectMetadataId) ??
      new Set<string>();

    fieldNames.add(flatFieldMetadata.name);
    fieldNamesByObjectId.set(flatFieldMetadata.objectMetadataId, fieldNames);
  }

  const groupsToCreate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[] =
    [];
  const skippedGroups: SkippedMorphFieldGroup[] = [];

  for (const [morphId, targets] of targetsByMorphId) {
    if (isDefined(flatFieldMetadataMaps.byUniversalIdentifier[morphId])) {
      continue;
    }

    const objectMetadataIds = new Set(
      targets.map((target) => target.objectMetadataId),
    );

    if (objectMetadataIds.size > 1) {
      skippedGroups.push({
        morphId,
        reason: 'morph id is shared by fields on several objects',
      });
      continue;
    }

    const survivor = pickMorphGroupSurvivorOrThrow(targets);
    const relationTargetObjectMetadata = isRelationFieldMetadataWithTarget(
      survivor,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: survivor.relationTargetObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        })
      : undefined;
    const inverseFlatFieldMetadata = isRelationFieldMetadataWithTarget(survivor)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: survivor.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (
      !isDefined(relationTargetObjectMetadata) ||
      !isDefined(inverseFlatFieldMetadata)
    ) {
      skippedGroups.push({
        morphId,
        reason: 'representative target has no relation target',
      });
      continue;
    }

    const standardFlatFieldMetadata =
      standardFlatFieldMetadataMaps.byUniversalIdentifier[morphId];
    const name =
      standardFlatFieldMetadata?.name ??
      getMorphNameFromMorphFieldMetadataName({
        morphRelationFlatFieldMetadata: survivor,
        nameSingular: relationTargetObjectMetadata.nameSingular,
        namePlural: relationTargetObjectMetadata.namePlural,
      });
    const objectFieldNames =
      fieldNamesByObjectId.get(survivor.objectMetadataId) ?? new Set<string>();

    if (objectFieldNames.has(name)) {
      skippedGroups.push({
        morphId,
        reason: `name "${name}" is already used on the object`,
      });
      continue;
    }

    objectFieldNames.add(name);

    const { joinColumnName: _joinColumnName, ...settings } = survivor.settings;
    const {
      joinColumnName: _universalJoinColumnName,
      ...universalSettings
    } = survivor.universalSettings;
    const inverseSettings = {
      targetFieldLabel: inverseFlatFieldMetadata.label,
      targetFieldName: inverseFlatFieldMetadata.name,
      targetFieldIcon: inverseFlatFieldMetadata.icon ?? undefined,
    };
    const baseFlatFieldMetadata =
      isDefined(standardFlatFieldMetadata) &&
      isFlatFieldMetadataOfType(
        standardFlatFieldMetadata,
        FieldMetadataType.MORPH_RELATION,
      )
        ? standardFlatFieldMetadata
        : survivor;

    groupsToCreate.push({
      ...baseFlatFieldMetadata,
      id: v4(),
      universalIdentifier: morphId,
      morphId,
      name,
      workspaceId: survivor.workspaceId,
      applicationId: survivor.applicationId,
      applicationUniversalIdentifier: survivor.applicationUniversalIdentifier,
      objectMetadataId: survivor.objectMetadataId,
      objectMetadataUniversalIdentifier:
        survivor.objectMetadataUniversalIdentifier,
      overrides: survivor.overrides,
      isSystemSideEffect: false,
      settings: { ...settings, ...inverseSettings },
      universalSettings: { ...universalSettings, ...inverseSettings },
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataId: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
      viewFieldIds: [],
      viewFilterIds: [],
      viewSortIds: [],
      fieldPermissionIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      calendarEndViewIds: [],
      mainGroupByFieldMetadataViewIds: [],
      searchFieldMetadataIds: [],
      viewFieldUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      viewSortUniversalIdentifiers: [],
      fieldPermissionUniversalIdentifiers: [],
      kanbanAggregateOperationViewUniversalIdentifiers: [],
      calendarViewUniversalIdentifiers: [],
      calendarEndViewUniversalIdentifiers: [],
      mainGroupByFieldMetadataViewUniversalIdentifiers: [],
      searchFieldMetadataUniversalIdentifiers: [],
    });
  }

  return { groupsToCreate, skippedGroups };
};
