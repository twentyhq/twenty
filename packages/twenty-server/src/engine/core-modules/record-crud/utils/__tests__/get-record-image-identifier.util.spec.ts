import { FieldMetadataType, FileFolder } from 'twenty-shared/types';

import { getRecordImageIdentifier } from 'src/engine/core-modules/record-crud/utils/get-record-image-identifier.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const buildFieldMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => {
  const byUniversalIdentifier: Record<string, FlatFieldMetadata> = {};
  const universalIdentifierById: Record<string, string> = {};

  for (const field of fields) {
    byUniversalIdentifier[field.universalIdentifier] = field;
    universalIdentifierById[field.id] = field.universalIdentifier;
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById,
    universalIdentifiersByApplicationId: {},
  };
};

const signUrl = (fileId: string, fileFolder: FileFolder) =>
  `signed:${fileFolder}:${fileId}`;

describe('getRecordImageIdentifier', () => {
  it('resolves a LINKS image identifier to a favicon url', async () => {
    const domainNameField = getFlatFieldMetadataMock({
      universalIdentifier: 'domain-ui',
      objectMetadataId: 'company-id',
      id: 'domain-id',
      name: 'domainName',
      type: FieldMetadataType.LINKS,
    });
    const company = getFlatObjectMetadataMock({
      universalIdentifier: 'company-ui',
      id: 'company-id',
      nameSingular: 'company',
      imageIdentifierFieldMetadataId: 'domain-id',
    });

    const result = await getRecordImageIdentifier({
      record: { domainName: { primaryLinkUrl: 'twenty.com' } },
      flatObjectMetadata: company,
      flatFieldMetadataMaps: buildFieldMaps([domainNameField]),
      allowRequestsToTwentyIcons: true,
    });

    expect(result).toBe('https://twenty-icons.com/twenty.com');
  });

  it('returns null for a LINKS image identifier when twenty-icons requests are disabled', async () => {
    const domainNameField = getFlatFieldMetadataMock({
      universalIdentifier: 'domain-ui',
      objectMetadataId: 'company-id',
      id: 'domain-id',
      name: 'domainName',
      type: FieldMetadataType.LINKS,
    });
    const company = getFlatObjectMetadataMock({
      universalIdentifier: 'company-ui',
      id: 'company-id',
      nameSingular: 'company',
      imageIdentifierFieldMetadataId: 'domain-id',
    });

    const result = await getRecordImageIdentifier({
      record: { domainName: { primaryLinkUrl: 'twenty.com' } },
      flatObjectMetadata: company,
      flatFieldMetadataMaps: buildFieldMaps([domainNameField]),
      allowRequestsToTwentyIcons: false,
    });

    expect(result).toBe(null);
  });

  it('resolves a FILES image identifier to a signed url', async () => {
    const avatarFileField = getFlatFieldMetadataMock({
      universalIdentifier: 'avatar-ui',
      objectMetadataId: 'person-id',
      id: 'avatar-id',
      name: 'avatarFile',
      type: FieldMetadataType.FILES,
    });
    const person = getFlatObjectMetadataMock({
      universalIdentifier: 'person-ui',
      id: 'person-id',
      nameSingular: 'person',
      imageIdentifierFieldMetadataId: 'avatar-id',
    });

    const result = await getRecordImageIdentifier({
      record: { avatarFile: [{ fileId: 'file-1' }] },
      flatObjectMetadata: person,
      flatFieldMetadataMaps: buildFieldMaps([avatarFileField]),
      allowRequestsToTwentyIcons: true,
      signUrl,
    });

    expect(result).toBe(`signed:${FileFolder.FilesField}:file-1`);
  });

  it('returns null for a FILES image identifier when signUrl is not provided', async () => {
    const avatarFileField = getFlatFieldMetadataMock({
      universalIdentifier: 'avatar-ui',
      objectMetadataId: 'person-id',
      id: 'avatar-id',
      name: 'avatarFile',
      type: FieldMetadataType.FILES,
    });
    const person = getFlatObjectMetadataMock({
      universalIdentifier: 'person-ui',
      id: 'person-id',
      nameSingular: 'person',
      imageIdentifierFieldMetadataId: 'avatar-id',
    });

    const result = await getRecordImageIdentifier({
      record: { avatarFile: [{ fileId: 'file-1' }] },
      flatObjectMetadata: person,
      flatFieldMetadataMaps: buildFieldMaps([avatarFileField]),
      allowRequestsToTwentyIcons: true,
    });

    expect(result).toBe(null);
  });

  it('prefers the overrides column over the base image identifier', async () => {
    const baseTextField = getFlatFieldMetadataMock({
      universalIdentifier: 'text-ui',
      objectMetadataId: 'custom-id',
      id: 'text-id',
      name: 'baseText',
      type: FieldMetadataType.TEXT,
    });
    const domainNameField = getFlatFieldMetadataMock({
      universalIdentifier: 'domain-ui',
      objectMetadataId: 'custom-id',
      id: 'domain-id',
      name: 'domainName',
      type: FieldMetadataType.LINKS,
    });
    const customObject = getFlatObjectMetadataMock({
      universalIdentifier: 'custom-ui',
      id: 'custom-id',
      nameSingular: 'custom',
      imageIdentifierFieldMetadataId: 'text-id',
      overrides: { imageIdentifierFieldMetadataId: 'domain-id' },
    });

    const result = await getRecordImageIdentifier({
      record: {
        baseText: 'ignored',
        domainName: { primaryLinkUrl: 'acme.com' },
      },
      flatObjectMetadata: customObject,
      flatFieldMetadataMaps: buildFieldMaps([baseTextField, domainNameField]),
      allowRequestsToTwentyIcons: true,
    });

    expect(result).toBe('https://twenty-icons.com/acme.com');
  });

  it('respects an explicit null override (cleared image identifier)', async () => {
    const domainNameField = getFlatFieldMetadataMock({
      universalIdentifier: 'domain-ui',
      objectMetadataId: 'custom-id',
      id: 'domain-id',
      name: 'domainName',
      type: FieldMetadataType.LINKS,
    });
    const customObject = getFlatObjectMetadataMock({
      universalIdentifier: 'custom-ui',
      id: 'custom-id',
      nameSingular: 'custom',
      imageIdentifierFieldMetadataId: 'domain-id',
      overrides: { imageIdentifierFieldMetadataId: null },
    });

    const result = await getRecordImageIdentifier({
      record: { domainName: { primaryLinkUrl: 'acme.com' } },
      flatObjectMetadata: customObject,
      flatFieldMetadataMaps: buildFieldMaps([domainNameField]),
      allowRequestsToTwentyIcons: true,
    });

    expect(result).toBe(null);
  });

  it('returns null when the image identifier field cannot be resolved', async () => {
    const customObject = getFlatObjectMetadataMock({
      universalIdentifier: 'custom-ui',
      id: 'custom-id',
      nameSingular: 'custom',
      imageIdentifierFieldMetadataId: 'missing-id',
    });

    const result = await getRecordImageIdentifier({
      record: {},
      flatObjectMetadata: customObject,
      flatFieldMetadataMaps: buildFieldMaps([]),
      allowRequestsToTwentyIcons: true,
    });

    expect(result).toBe(null);
  });

  it('signs the workspace member avatar url as a CorePicture (exception)', async () => {
    const fileId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
    const workspaceMember = getFlatObjectMetadataMock({
      universalIdentifier: 'workspace-member-ui',
      id: 'workspace-member-id',
      nameSingular: 'workspaceMember',
    });

    const result = await getRecordImageIdentifier({
      record: {
        avatarUrl: `https://example.com/file/${FileFolder.CorePicture}/${fileId}`,
      },
      flatObjectMetadata: workspaceMember,
      flatFieldMetadataMaps: buildFieldMaps([]),
      allowRequestsToTwentyIcons: true,
      signUrl,
    });

    expect(result).toBe(`signed:${FileFolder.CorePicture}:${fileId}`);
  });
});
