import { type ObjectManifest } from 'twenty-shared/application';
import {
  MetadataReadability,
  MetadataWritability,
  ObjectOpenRecordIn,
} from 'twenty-shared/types';

import { fromFlatObjectMetadataToObjectManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-metadata-to-object-manifest.util';
import { fromObjectManifestToUniversalFlatObjectMetadata } from 'src/engine/core-modules/application/application-manifest/converters/from-object-manifest-to-universal-flat-object-metadata.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const LABEL_FIELD_UID = '33333333-3333-4333-8333-333333333333';
const IMAGE_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const PARENT_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-03T10:00:00.000Z';

const OBJECT_MANIFEST: Required<ObjectManifest> = {
  universalIdentifier: OBJECT_UID,
  nameSingular: 'pet',
  namePlural: 'pets',
  labelSingular: 'Pet',
  labelPlural: 'Pets',
  description: 'A pet',
  icon: 'IconCat',
  color: 'blue',
  isLabelSyncedWithName: true,
  isSearchable: false,
  isUICreatable: false,
  isUIEditable: false,
  writability: MetadataWritability.APPLICATION,
  readability: MetadataReadability.INHERITED,
  readabilityParentFieldUniversalIdentifiers: [PARENT_FIELD_UID],
  openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
  labelIdentifierFieldMetadataUniversalIdentifier: LABEL_FIELD_UID,
  imageIdentifierFieldMetadataUniversalIdentifier: IMAGE_FIELD_UID,
  fields: [],
};

describe('fromFlatObjectMetadataToObjectManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    const universalFlatObjectMetadata =
      fromObjectManifestToUniversalFlatObjectMetadata({
        objectManifest: OBJECT_MANIFEST,
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(
      fromFlatObjectMetadataToObjectManifest({
        flatObjectMetadata: universalFlatObjectMetadata,
        fields: [],
        labelIdentifierFieldMetadataUniversalIdentifier: LABEL_FIELD_UID,
      }),
    ).toEqual(OBJECT_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatObjectMetadata = getFlatObjectMetadataMock({
      universalIdentifier: OBJECT_UID,
      applicationUniversalIdentifier: APP_UID,
      description: null,
      icon: null,
      color: 'red',
      isLabelSyncedWithName: true,
      isSearchable: false,
      writability: MetadataWritability.APPLICATION,
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [PARENT_FIELD_UID],
      openRecordIn: ObjectOpenRecordIn.SIDE_PANEL,
      labelIdentifierFieldMetadataUniversalIdentifier: LABEL_FIELD_UID,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    });

    const rebuiltFlatObjectMetadata =
      fromObjectManifestToUniversalFlatObjectMetadata({
        objectManifest: fromFlatObjectMetadataToObjectManifest({
          flatObjectMetadata,
          fields: [],
          labelIdentifierFieldMetadataUniversalIdentifier: LABEL_FIELD_UID,
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatObjectMetadata,
        toUniversalFlatEntity: rebuiltFlatObjectMetadata,
        metadataName: 'objectMetadata',
      }),
    ).toBeUndefined();
  });
});
