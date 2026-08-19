import { getViewGroupUniversalIdentifier } from 'twenty-shared/application';
import { VIEW_GROUP_VISIBLE_OPTIONS_MAX } from 'twenty-shared/constants';
import { ViewType } from 'twenty-shared/types';

import { fromViewManifestToDerivedUniversalFlatViewGroups } from 'src/engine/core-modules/application/application-manifest/converters/from-view-manifest-to-derived-universal-flat-view-groups.util';

describe('fromViewManifestToDerivedUniversalFlatViewGroups', () => {
  const now = '2026-01-01T00:00:00.000Z';
  const applicationUniversalIdentifier = '3a3946f1-3f2c-4e2f-94a4-3b6c3c9f8ae1';
  const viewUniversalIdentifier = 'b52a09f5-8a2e-4c47-9efb-4f2f8f6a9c72';

  const viewManifest = {
    universalIdentifier: viewUniversalIdentifier,
    name: 'By Stage',
    objectUniversalIdentifier: 'c9a1f9de-7d09-4a45-a1cb-53f0c65b12d4',
    type: ViewType.KANBAN,
    mainGroupByFieldMetadataUniversalIdentifier:
      'd4e8b0af-6f7a-42be-9d3a-8f1b7f2c3e55',
  };

  const selectOptions = [
    { id: 'option-1', label: 'New', value: 'NEW', position: 0 },
    { id: 'option-2', label: 'Ongoing', value: 'ONGOING', position: 1 },
    { id: 'option-3', label: 'Done', value: 'DONE', position: 2 },
  ];

  it('should derive one view group per select option plus a trailing empty group when the field is nullable', () => {
    const result = fromViewManifestToDerivedUniversalFlatViewGroups({
      viewManifest,
      mainGroupByFlatFieldMetadata: {
        options: selectOptions,
        isNullable: true,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result).toHaveLength(4);
    expect(result.map(({ fieldValue }) => fieldValue)).toEqual([
      'NEW',
      'ONGOING',
      'DONE',
      '',
    ]);
    expect(result.map(({ position }) => position)).toEqual([0, 1, 2, 3]);
    expect(result.every(({ isVisible }) => isVisible)).toBe(true);
    expect(
      result.every(
        (viewGroup) =>
          viewGroup.viewUniversalIdentifier === viewUniversalIdentifier,
      ),
    ).toBe(true);
    expect(
      result.every(
        (viewGroup) =>
          viewGroup.applicationUniversalIdentifier ===
          applicationUniversalIdentifier,
      ),
    ).toBe(true);
    expect(
      result.every(
        (viewGroup) =>
          viewGroup.createdAt === now &&
          viewGroup.updatedAt === now &&
          viewGroup.deletedAt === null,
      ),
    ).toBe(true);
  });

  it('should not derive an empty group when the field is not nullable', () => {
    const result = fromViewManifestToDerivedUniversalFlatViewGroups({
      viewManifest,
      mainGroupByFlatFieldMetadata: {
        options: selectOptions,
        isNullable: false,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result.map(({ fieldValue }) => fieldValue)).toEqual([
      'NEW',
      'ONGOING',
      'DONE',
    ]);
  });

  it('should derive only the empty group for an optionless nullable group-by field', () => {
    const result = fromViewManifestToDerivedUniversalFlatViewGroups({
      viewManifest,
      mainGroupByFlatFieldMetadata: {
        options: null,
        isNullable: true,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result).toHaveLength(1);
    expect(result[0].fieldValue).toBe('');
    expect(result[0].position).toBe(0);
  });

  it('should derive deterministic universal identifiers stable across recomputations', () => {
    const computeTwice = () =>
      fromViewManifestToDerivedUniversalFlatViewGroups({
        viewManifest,
        mainGroupByFlatFieldMetadata: {
          options: selectOptions,
          isNullable: true,
        },
        applicationUniversalIdentifier,
        now,
      });

    const [firstComputation, secondComputation] = [
      computeTwice(),
      computeTwice(),
    ];

    expect(
      firstComputation.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(
      secondComputation.map(({ universalIdentifier }) => universalIdentifier),
    );

    expect(firstComputation[0].universalIdentifier).toBe(
      getViewGroupUniversalIdentifier({
        applicationUniversalIdentifier,
        viewUniversalIdentifier,
        fieldValue: 'NEW',
      }),
    );

    expect(
      new Set(
        firstComputation.map(({ universalIdentifier }) => universalIdentifier),
      ).size,
    ).toBe(firstComputation.length);
  });

  it('should hide derived groups beyond the visible options maximum', () => {
    const manyOptions = Array.from(
      { length: VIEW_GROUP_VISIBLE_OPTIONS_MAX + 1 },
      (_, index) => ({
        id: `option-${index}`,
        label: `Option ${index}`,
        value: `OPTION_${index}`,
        position: index,
      }),
    );

    const result = fromViewManifestToDerivedUniversalFlatViewGroups({
      viewManifest,
      mainGroupByFlatFieldMetadata: {
        options: manyOptions,
        isNullable: false,
      },
      applicationUniversalIdentifier,
      now,
    });

    expect(result).toHaveLength(VIEW_GROUP_VISIBLE_OPTIONS_MAX + 1);
    expect(result[VIEW_GROUP_VISIBLE_OPTIONS_MAX - 1].isVisible).toBe(true);
    expect(result[VIEW_GROUP_VISIBLE_OPTIONS_MAX].isVisible).toBe(false);
  });
});
