import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  buildRecordShareNoneAccessLevelOptionSyncOperations,
  RECORD_SHARE_ACCESS_LEVEL_DEFAULT_VALUE,
  RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-record-share-none-access-level-option-sync-operations.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const NOW = '2026-10-01T12:00:00.000Z';
const ACCESS_LEVEL_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.recordShare.fields.accessLevel.universalIdentifier;

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-30T12:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const standardAccessLevelField =
  allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
    ACCESS_LEVEL_FIELD_UNIVERSAL_IDENTIFIER
  ];

if (!isDefined(standardAccessLevelField)) {
  throw new Error('Standard recordShare accessLevel field missing');
}

const getOptions = (field: { options?: unknown }) =>
  (field.options ?? []) as FieldMetadataComplexOption[];

const buildMaps = (
  field: FlatFieldMetadata | undefined,
): FlatEntityMaps<FlatFieldMetadata> =>
  ({
    byUniversalIdentifier: isDefined(field)
      ? { [ACCESS_LEVEL_FIELD_UNIVERSAL_IDENTIFIER]: field }
      : {},
  }) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const fieldWithoutNoneOption: FlatFieldMetadata = {
  ...standardAccessLevelField,
  defaultValue: null,
  options: getOptions(standardAccessLevelField).filter(
    (option) => option.value !== RecordShareAccessLevel.NONE,
  ),
};

describe('buildRecordShareNoneAccessLevelOptionSyncOperations', () => {
  it('should match the option declared on the standard field', () => {
    expect(getOptions(standardAccessLevelField)).toContainEqual(
      expect.objectContaining({
        id: RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION.id,
        value: RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION.value,
        position: RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION.position,
        color: RECORD_SHARE_NONE_ACCESS_LEVEL_OPTION.color,
      }),
    );
  });

  it('should match the default declared on the standard field', () => {
    expect(standardAccessLevelField.defaultValue).toBe(
      RECORD_SHARE_ACCESS_LEVEL_DEFAULT_VALUE,
    );
  });

  it('should give the field the default it needs to be updated', () => {
    const { flatEntityToUpdate } =
      buildRecordShareNoneAccessLevelOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildMaps(fieldWithoutNoneOption),
        now: NOW,
        direction: 'up',
      });

    expect(flatEntityToUpdate[0].defaultValue).toBe(
      RECORD_SHARE_ACCESS_LEVEL_DEFAULT_VALUE,
    );
  });

  it('should append the NONE option when it is missing', () => {
    const { flatEntityToUpdate } =
      buildRecordShareNoneAccessLevelOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildMaps(fieldWithoutNoneOption),
        now: NOW,
        direction: 'up',
      });

    expect(flatEntityToUpdate).toHaveLength(1);
    expect(getOptions(flatEntityToUpdate[0]).map(({ value }) => value)).toEqual(
      [
        RecordShareAccessLevel.READ,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
        RecordShareAccessLevel.NONE,
      ],
    );
    expect(flatEntityToUpdate[0].updatedAt).toBe(NOW);
  });

  it('should do nothing when the option is already there', () => {
    expect(
      buildRecordShareNoneAccessLevelOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildMaps(standardAccessLevelField),
        now: NOW,
        direction: 'up',
      }).flatEntityToUpdate,
    ).toEqual([]);
  });

  it('should remove the option on the way down', () => {
    const { flatEntityToUpdate } =
      buildRecordShareNoneAccessLevelOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildMaps(standardAccessLevelField),
        now: NOW,
        direction: 'down',
      });

    expect(
      getOptions(flatEntityToUpdate[0]).map(({ value }) => value),
    ).not.toContain(RecordShareAccessLevel.NONE);
  });

  it('should do nothing when the record share object is not provisioned', () => {
    expect(
      buildRecordShareNoneAccessLevelOptionSyncOperations({
        existingFlatFieldMetadataMaps: buildMaps(undefined),
        now: NOW,
        direction: 'up',
      }).flatEntityToUpdate,
    ).toEqual([]);
  });
});
