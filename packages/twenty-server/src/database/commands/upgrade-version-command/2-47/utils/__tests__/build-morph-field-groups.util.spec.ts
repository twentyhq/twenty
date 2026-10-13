import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { buildMorphFieldGroups } from 'src/database/commands/upgrade-version-command/2-47/utils/build-morph-field-groups.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const {
  allFlatEntityMaps: {
    flatFieldMetadataMaps: standardFlatFieldMetadataMaps,
    flatObjectMetadataMaps,
  },
} = computeTwentyStandardApplicationAllFlatEntityMaps({
  workspaceId: 'workspace-id',
  twentyStandardApplicationId: 'application-id',
  now: '2026-10-13T12:00:00.000Z',
});

const standardFlatFieldMetadatas = Object.values(
  standardFlatFieldMetadataMaps.byUniversalIdentifier,
).filter(isDefined);

const STANDARD_MORPH_IDS = standardFlatFieldMetadatas
  .filter(isMorphRelationGroup)
  .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

const createFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> =>
  flatFieldMetadatas.reduce<FlatEntityMaps<FlatFieldMetadata>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const flatFieldMetadatasBeforeBackfill = standardFlatFieldMetadatas.filter(
  (flatFieldMetadata) => !isMorphRelationGroup(flatFieldMetadata),
);

describe('buildMorphFieldGroups', () => {
  it('should create one group per standard morph field', () => {
    const { groupsToCreate, skippedGroups } = buildMorphFieldGroups({
      flatFieldMetadataMaps: createFlatFieldMetadataMaps(
        flatFieldMetadatasBeforeBackfill,
      ),
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(skippedGroups).toEqual([]);
    expect(
      groupsToCreate.map((group) => group.universalIdentifier).sort(),
    ).toEqual([...STANDARD_MORPH_IDS].sort());

    const noteTargetGroup = groupsToCreate.find(
      (group) =>
        group.universalIdentifier ===
        STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
    );

    expect(noteTargetGroup).toMatchObject({
      name: 'target',
      morphId: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataId: null,
      viewFieldIds: [],
    });
    expect(isMorphRelationGroup(noteTargetGroup!)).toBe(true);
    expect(noteTargetGroup?.settings).not.toHaveProperty('joinColumnName');
  });

  it('should not create groups that already exist', () => {
    const { groupsToCreate, skippedGroups } = buildMorphFieldGroups({
      flatFieldMetadataMaps: standardFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(groupsToCreate).toEqual([]);
    expect(skippedGroups).toEqual([]);
  });

  it('should skip a group whose name is already used on its object', () => {
    const noteTargetMorphId =
      STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId;
    const noteTargetObjectMetadataId =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.noteTarget.universalIdentifier
      ]?.id;
    const conflictingField = {
      ...flatFieldMetadatasBeforeBackfill.find(
        (flatFieldMetadata) =>
          flatFieldMetadata.objectMetadataId === noteTargetObjectMetadataId &&
          flatFieldMetadata.name === 'id',
      )!,
      id: 'conflicting-field-id',
      universalIdentifier: 'conflicting-field',
      name: 'target',
    };

    const { groupsToCreate, skippedGroups } = buildMorphFieldGroups({
      flatFieldMetadataMaps: createFlatFieldMetadataMaps([
        ...flatFieldMetadatasBeforeBackfill,
        conflictingField,
      ]),
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(skippedGroups).toEqual([
      {
        morphId: noteTargetMorphId,
        reason: 'name "target" is already used on the object',
      },
    ]);
    expect(
      groupsToCreate.map((group) => group.universalIdentifier),
    ).not.toContain(noteTargetMorphId);
    expect(groupsToCreate).toHaveLength(STANDARD_MORPH_IDS.length - 1);
  });

  it('should skip a morph id shared by fields on several objects', () => {
    const noteTargetMorphId =
      STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId;
    const taskTargetMorphId =
      STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId;

    const { groupsToCreate, skippedGroups } = buildMorphFieldGroups({
      flatFieldMetadataMaps: createFlatFieldMetadataMaps(
        flatFieldMetadatasBeforeBackfill.map((flatFieldMetadata) =>
          flatFieldMetadata.morphId === taskTargetMorphId
            ? { ...flatFieldMetadata, morphId: noteTargetMorphId }
            : flatFieldMetadata,
        ),
      ),
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(skippedGroups).toEqual([
      {
        morphId: noteTargetMorphId,
        reason: 'morph id is shared by fields on several objects',
      },
    ]);
    expect(
      groupsToCreate.map((group) => group.universalIdentifier),
    ).not.toContain(noteTargetMorphId);
  });
});
