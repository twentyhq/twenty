import {
  type RegularFieldManifest,
  type RelationFieldManifest,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-field-manifest-to-universal-flat-field-metadata.util';
import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { getFlatFieldMetadataOptionMock } from 'src/engine/metadata-modules/flat-field-metadata-option/__mocks__/get-flat-field-metadata-option.mock';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const FIELD_UID = '33333333-3333-4333-8333-333333333333';
const TARGET_OBJECT_UID = '44444444-4444-4444-8444-444444444444';
const TARGET_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-03T10:00:00.000Z';
const OPEN_OPTION_UID = '77777777-7777-4777-8777-777777777771';
const CLOSED_OPTION_UID = '77777777-7777-4777-8777-777777777772';
const ARCHIVED_OPTION_UID = '77777777-7777-4777-8777-777777777773';

const APPLICATION_FLAT_FIELD_METADATA_OPTION_MAPS = {
  byUniversalIdentifier: {
    [OPEN_OPTION_UID]: getFlatFieldMetadataOptionMock({
      universalIdentifier: OPEN_OPTION_UID,
      value: 'OPEN',
      label: 'Open',
      position: 0,
    }),
    [CLOSED_OPTION_UID]: getFlatFieldMetadataOptionMock({
      universalIdentifier: CLOSED_OPTION_UID,
      value: 'CLOSED',
      label: 'Closed',
      position: 1,
    }),
  },
};

const exportFieldWithWorkspaceAddedOption = ({
  type,
  defaultValue,
}: {
  type: FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT;
  defaultValue: string | string[];
}) =>
  fromFlatFieldMetadataToFieldManifest({
    flatFieldMetadata: getFlatFieldMetadataMock({
      universalIdentifier: FIELD_UID,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: OBJECT_UID,
      applicationUniversalIdentifier: APP_UID,
      type,
      name: 'status',
      label: 'Status',
      fieldMetadataOptionUniversalIdentifiers: [
        OPEN_OPTION_UID,
        CLOSED_OPTION_UID,
        ARCHIVED_OPTION_UID,
      ],
      defaultValue,
    }),
    flatFieldMetadataOptionMaps: APPLICATION_FLAT_FIELD_METADATA_OPTION_MAPS,
  });

const TEXT_FIELD_MANIFEST: Required<
  RegularFieldManifest<FieldMetadataType.TEXT>
> = {
  universalIdentifier: FIELD_UID,
  type: FieldMetadataType.TEXT,
  name: 'title',
  label: 'Title',
  description: 'The title',
  icon: 'IconAbc',
  options: null,
  universalSettings: null,
  defaultValue: "'untitled'",
  isNullable: false,
  isUIEditable: false,
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
  isUnique: true,
  isSearchable: true,
  isAuditLogged: false,
  isLabelSyncedWithName: true,
  objectUniversalIdentifier: OBJECT_UID,
};

const RELATION_FIELD_MANIFEST: Required<
  Omit<RelationFieldManifest<FieldMetadataType.RELATION>, 'morphId'>
> = {
  universalIdentifier: FIELD_UID,
  type: FieldMetadataType.RELATION,
  name: 'project',
  label: 'Project',
  description: 'The project',
  icon: 'IconFolder',
  options: null,
  defaultValue: null,
  isNullable: true,
  isUIEditable: true,
  disabledFieldPermissionActions: [],
  isUnique: false,
  isSearchable: false,
  isAuditLogged: true,
  isLabelSyncedWithName: false,
  objectUniversalIdentifier: OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier: TARGET_FIELD_UID,
  relationTargetObjectMetadataUniversalIdentifier: TARGET_OBJECT_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'projectId',
    onDelete: RelationOnDeleteAction.SET_NULL,
  },
};

const roundTripFlatFieldMetadata = (
  flatFieldMetadata: ReturnType<typeof getFlatFieldMetadataMock>,
) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatFieldMetadata,
    toUniversalFlatEntity: fromFieldManifestToUniversalFlatFieldMetadata({
      fieldManifest: fromFlatFieldMetadataToFieldManifest({
        flatFieldMetadata,
        flatFieldMetadataOptionMaps: createEmptyFlatEntityMaps(),
      }),
      applicationUniversalIdentifier: APP_UID,
      now: NOW,
    }),
    metadataName: 'fieldMetadata',
  });

describe('fromFlatFieldMetadataToFieldManifest', () => {
  it('should reproduce a regular field manifest after a forward then an inverse conversion', () => {
    const universalFlatFieldMetadata =
      fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: TEXT_FIELD_MANIFEST,
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(
      fromFlatFieldMetadataToFieldManifest({
        flatFieldMetadata: universalFlatFieldMetadata,
        flatFieldMetadataOptionMaps: createEmptyFlatEntityMaps(),
      }),
    ).toEqual(TEXT_FIELD_MANIFEST);
  });

  it('should reproduce a relation field manifest after a forward then an inverse conversion', () => {
    const universalFlatFieldMetadata =
      fromFieldManifestToUniversalFlatFieldMetadata({
        fieldManifest: RELATION_FIELD_MANIFEST,
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(
      fromFlatFieldMetadataToFieldManifest({
        flatFieldMetadata: universalFlatFieldMetadata,
        flatFieldMetadataOptionMaps: createEmptyFlatEntityMaps(),
      }),
    ).toEqual(RELATION_FIELD_MANIFEST);
  });

  it('should reproduce a select field after an inverse then a forward conversion', () => {
    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: FIELD_UID,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: OBJECT_UID,
      applicationUniversalIdentifier: APP_UID,
      type: FieldMetadataType.SELECT,
      name: 'status',
      label: 'Status',
      description: null,
      icon: null,
      options: [
        {
          id: '66666666-6666-4666-8666-666666666666',
          value: 'OPEN',
          label: 'Open',
          color: 'green',
          position: 0,
        },
      ],
      defaultValue: "'OPEN'",
      isLabelSyncedWithName: true,
      isUnique: false,
    });

    expect(roundTripFlatFieldMetadata(flatFieldMetadata)).toBeUndefined();
  });

  it('should export the base values of an option a workspace overrides', () => {
    const optionUniversalIdentifier = '77777777-7777-4777-8777-777777777777';
    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: FIELD_UID,
      objectMetadataId: 'object-metadata-id',
      type: FieldMetadataType.SELECT,
      fieldMetadataOptionUniversalIdentifiers: [optionUniversalIdentifier],
    });

    const fieldManifest = fromFlatFieldMetadataToFieldManifest({
      flatFieldMetadata,
      flatFieldMetadataOptionMaps: {
        ...createEmptyFlatEntityMaps(),
        byUniversalIdentifier: {
          [optionUniversalIdentifier]: getFlatFieldMetadataOptionMock({
            universalIdentifier: optionUniversalIdentifier,
            value: 'SCREENING',
            label: 'Screening',
            color: 'blue',
            position: 0,
            applicationId: flatFieldMetadata.applicationId,
            overrides: {
              [APP_UID]: { label: 'Workspace screening', color: 'red' },
            },
          }),
        },
      },
    });

    expect(fieldManifest.options).toEqual([
      {
        id: optionUniversalIdentifier,
        value: 'SCREENING',
        label: 'Screening',
        color: 'blue',
        position: 0,
      },
    ]);
  });

  it('should copy the universal settings of a junction relation', () => {
    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: FIELD_UID,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: OBJECT_UID,
      applicationUniversalIdentifier: APP_UID,
      type: FieldMetadataType.RELATION,
      name: 'caretakers',
      label: 'Caretakers',
      relationTargetFieldMetadataUniversalIdentifier: TARGET_FIELD_UID,
      relationTargetObjectMetadataUniversalIdentifier: TARGET_OBJECT_UID,
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldUniversalIdentifier: TARGET_FIELD_UID,
      },
    });

    expect(
      fromFlatFieldMetadataToFieldManifest({
        flatFieldMetadata,
        flatFieldMetadataOptionMaps: createEmptyFlatEntityMaps(),
      }).universalSettings,
    ).toEqual({
      relationType: RelationType.ONE_TO_MANY,
      junctionTargetFieldUniversalIdentifier: TARGET_FIELD_UID,
    });
  });

  it('should reproduce an actor field without default value after an inverse then a forward conversion', () => {
    const flatFieldMetadata = getFlatFieldMetadataMock({
      universalIdentifier: FIELD_UID,
      objectMetadataId: 'object-metadata-id',
      objectMetadataUniversalIdentifier: OBJECT_UID,
      applicationUniversalIdentifier: APP_UID,
      type: FieldMetadataType.ACTOR,
      name: 'author',
      label: 'Author',
      defaultValue: null,
    });

    expect(roundTripFlatFieldMetadata(flatFieldMetadata)).toBeUndefined();
  });

  it('should drop a select default that points at a workspace-added option', () => {
    const fieldManifest = exportFieldWithWorkspaceAddedOption({
      type: FieldMetadataType.SELECT,
      defaultValue: "'ARCHIVED'",
    });

    expect(fieldManifest.options?.map(({ value }) => value)).toEqual([
      'OPEN',
      'CLOSED',
    ]);
    expect(fieldManifest.defaultValue).toBeNull();
  });

  it('should keep a select default that points at an exported option', () => {
    expect(
      exportFieldWithWorkspaceAddedOption({
        type: FieldMetadataType.SELECT,
        defaultValue: "'CLOSED'",
      }).defaultValue,
    ).toBe("'CLOSED'");
  });

  it('should keep only the multi-select defaults that point at exported options', () => {
    expect(
      exportFieldWithWorkspaceAddedOption({
        type: FieldMetadataType.MULTI_SELECT,
        defaultValue: ["'OPEN'", "'ARCHIVED'"],
      }).defaultValue,
    ).toEqual(["'OPEN'"]);
  });

  it('should drop a multi-select default whose values all point at workspace-added options', () => {
    expect(
      exportFieldWithWorkspaceAddedOption({
        type: FieldMetadataType.MULTI_SELECT,
        defaultValue: ["'ARCHIVED'"],
      }).defaultValue,
    ).toBeNull();
  });
});
