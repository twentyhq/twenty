import { FieldMetadataType } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { filterMorphRelationTargetFields } from 'src/engine/dataloaders/utils/filter-morph-relation-target-fields.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const {
  allFlatEntityMaps: { flatFieldMetadataMaps },
} = computeTwentyStandardApplicationAllFlatEntityMaps({
  workspaceId: 'workspace-id',
  twentyStandardApplicationId: 'application-id',
  now: '2026-10-09T12:00:00.000Z',
});
const field = (name: 'target' | 'targetPerson' | 'targetCompany') =>
  flatFieldMetadataMaps.byUniversalIdentifier[
    STANDARD_OBJECTS.noteTarget.fields[name].universalIdentifier
  ] as FlatFieldMetadata;
const group = field('target');
const NOTE_TARGET_FLAT_FIELDS_MOCK = {
  targetPerson: field('targetPerson'),
  targetCompany: field('targetCompany'),
};

describe('filterMorphRelationTargetFields', () => {
  it.each([
    [
      [
        NOTE_TARGET_FLAT_FIELDS_MOCK.targetPerson,
        NOTE_TARGET_FLAT_FIELDS_MOCK.targetCompany,
      ],
    ],
    [[NOTE_TARGET_FLAT_FIELDS_MOCK.targetCompany]],
    [[]],
  ])('keeps the same field as targets are removed: %j', (targets) => {
    expect(filterMorphRelationTargetFields([group, ...targets])).toEqual([
      group,
    ]);
  });

  it('does not elect an active target when the group is inactive', () => {
    const inactiveGroup = { ...group, isActive: false };
    expect(
      filterMorphRelationTargetFields([
        NOTE_TARGET_FLAT_FIELDS_MOCK.targetPerson,
        inactiveGroup,
      ]),
    ).toEqual([inactiveGroup]);
  });

  it('returns ordinary fields unchanged', () => {
    const field = { ...group, type: FieldMetadataType.TEXT, morphId: null };
    expect(filterMorphRelationTargetFields([field])).toEqual([field]);
  });
});
