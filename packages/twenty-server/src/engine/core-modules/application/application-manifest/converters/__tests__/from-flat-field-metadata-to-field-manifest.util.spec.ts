import {
  type RegularFieldManifest,
  type RelationFieldManifest,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { fromFieldManifestToUniversalFlatFieldMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-field-manifest-to-universal-flat-field-metadata.util';
import { fromFlatFieldMetadataToFieldManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-metadata-to-field-manifest.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const FIELD_UID = '33333333-3333-4333-8333-333333333333';
const TARGET_OBJECT_UID = '44444444-4444-4444-8444-444444444444';
const TARGET_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-03T10:00:00.000Z';

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
  writability: MetadataWritability.APPLICATION,
  isUnique: true,
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
  writability: MetadataWritability.OPEN,
  isUnique: false,
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
      fromFlatFieldMetadataToFieldManifest({ flatFieldMetadata })
        .universalSettings,
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
});
