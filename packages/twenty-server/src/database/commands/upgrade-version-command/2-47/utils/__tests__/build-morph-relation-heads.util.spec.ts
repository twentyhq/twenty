import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { buildMorphRelationHeads } from 'src/database/commands/upgrade-version-command/2-47/utils/build-morph-relation-heads.util';
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
  .filter(isMorphRelationHead)
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
  (flatFieldMetadata) => !isMorphRelationHead(flatFieldMetadata),
);

describe('buildMorphRelationHeads', () => {
  it('should create one head per standard morph field', () => {
    const { headsToCreate, skippedHeads } = buildMorphRelationHeads({
      flatFieldMetadataMaps: createFlatFieldMetadataMaps(
        flatFieldMetadatasBeforeBackfill,
      ),
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(skippedHeads).toEqual([]);
    expect(
      headsToCreate.map((head) => head.universalIdentifier).sort(),
    ).toEqual([...STANDARD_MORPH_IDS].sort());

    const noteTargetHead = headsToCreate.find(
      (head) =>
        head.universalIdentifier ===
        STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
    );

    expect(noteTargetHead).toMatchObject({
      name: 'target',
      morphId: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataId: null,
      viewFieldIds: [],
    });
    expect(isMorphRelationHead(noteTargetHead!)).toBe(true);
    expect(noteTargetHead?.settings).not.toHaveProperty('joinColumnName');
  });

  it('should not create heads that already exist', () => {
    const { headsToCreate, skippedHeads } = buildMorphRelationHeads({
      flatFieldMetadataMaps: standardFlatFieldMetadataMaps,
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(headsToCreate).toEqual([]);
    expect(skippedHeads).toEqual([]);
  });

  it('should skip a head whose name is already used on its object', () => {
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

    const { headsToCreate, skippedHeads } = buildMorphRelationHeads({
      flatFieldMetadataMaps: createFlatFieldMetadataMaps([
        ...flatFieldMetadatasBeforeBackfill,
        conflictingField,
      ]),
      flatObjectMetadataMaps,
      standardFlatFieldMetadataMaps,
    });

    expect(skippedHeads).toEqual([
      {
        morphId: noteTargetMorphId,
        reason: 'name "target" is already used on the object',
      },
    ]);
    expect(
      headsToCreate.map((head) => head.universalIdentifier),
    ).not.toContain(noteTargetMorphId);
    expect(headsToCreate).toHaveLength(STANDARD_MORPH_IDS.length - 1);
  });

  it('should skip a morph id shared by fields on several objects', () => {
    const noteTargetMorphId =
      STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId;
    const taskTargetMorphId =
      STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId;

    const { headsToCreate, skippedHeads } = buildMorphRelationHeads({
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

    expect(skippedHeads).toEqual([
      {
        morphId: noteTargetMorphId,
        reason: 'morph id is shared by fields on several objects',
      },
    ]);
    expect(
      headsToCreate.map((head) => head.universalIdentifier),
    ).not.toContain(noteTargetMorphId);
  });
});
