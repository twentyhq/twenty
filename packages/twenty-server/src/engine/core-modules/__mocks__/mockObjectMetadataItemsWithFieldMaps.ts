import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

const workspaceId = '20202020-0000-0000-0000-000000000000';

const personNameFieldId = 'nameFieldMetadataId-person';
const companyNameFieldId = 'nameFieldMetadataId-company';
const companyDomainNameFieldId = 'domainNameFieldMetadataId';
const customObjectNameFieldId = 'nameFieldMetadataId-custom';
const customObjectImageFieldId = 'imageIdentifierFieldMetadataId';

const personFlatObject = getFlatObjectMetadataMock({
  id: '20202020-8dec-43d5-b2ff-6eef05095bec',
  standardId: '20202020-8dec-43d5-b2ff-6eef05095bec',
  nameSingular: 'person',
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  description: 'A person',
  icon: 'test-person-icon',
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  labelIdentifierFieldMetadataId: personNameFieldId,
  imageIdentifierFieldMetadataId: null,
  workspaceId,
  universalIdentifier: '20202020-8dec-43d5-b2ff-6eef05095bec',
  fieldMetadataIds: [personNameFieldId],
  indexMetadataIds: [],
  viewIds: [],
});

const companyFlatObject = getFlatObjectMetadataMock({
  id: '20202020-c03c-45d6-a4b0-04afe1357c5c',
  standardId: '20202020-c03c-45d6-a4b0-04afe1357c5c',
  nameSingular: 'company',
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: 'test-company-icon',
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  labelIdentifierFieldMetadataId: companyNameFieldId,
  imageIdentifierFieldMetadataId: null,
  workspaceId,
  universalIdentifier: '20202020-c03c-45d6-a4b0-04afe1357c5c',
  fieldMetadataIds: [companyNameFieldId, companyDomainNameFieldId],
  indexMetadataIds: [],
  viewIds: [],
});

const customObjectFlatObject = getFlatObjectMetadataMock({
  id: '20202020-3d75-4aab-bacd-ee176c5f63ca',
  standardId: null,
  nameSingular: 'regular-custom-object',
  namePlural: 'regular-custom-objects',
  labelSingular: 'Regular Custom Object',
  labelPlural: 'Regular Custom Objects',
  description: 'A regular custom object',
  icon: 'test-regular-custom-object-icon',
  targetTableName: 'DEPRECATED',
  isCustom: true,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  labelIdentifierFieldMetadataId: customObjectNameFieldId,
  imageIdentifierFieldMetadataId: customObjectImageFieldId,
  workspaceId,
  universalIdentifier: '20202020-3d75-4aab-bacd-ee176c5f63ca',
  fieldMetadataIds: [customObjectNameFieldId, customObjectImageFieldId],
  indexMetadataIds: [],
  viewIds: [],
});

const nonSearchableFlatObject = getFlatObjectMetadataMock({
  id: '20202020-540c-4397-b872-2a90ea2fb809',
  standardId: '20202020-540c-4397-b872-2a90ea2fb809',
  nameSingular: 'non-searchable-object',
  namePlural: 'non-searchable-objects',
  labelSingular: '',
  labelPlural: '',
  description: '',
  icon: 'test-non-searchable-object-icon',
  targetTableName: 'DEPRECATED',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: true,
  isAuditLogged: true,
  isSearchable: false,
  labelIdentifierFieldMetadataId: null,
  imageIdentifierFieldMetadataId: null,
  workspaceId,
  universalIdentifier: '20202020-540c-4397-b872-2a90ea2fb809',
  fieldMetadataIds: [],
  indexMetadataIds: [],
  viewIds: [],
});

const personNameField = getFlatFieldMetadataMock({
  id: personNameFieldId,
  objectMetadataId: personFlatObject.id,
  type: FieldMetadataType.FULL_NAME,
  icon: 'test-field-icon',
  name: 'name',
  label: 'Name',
  defaultValue: {
    lastName: "''",
    firstName: "''",
  },
  description: "Contact's name",
  isCustom: false,
  isNullable: true,
  isUnique: false,
  isLabelSyncedWithName: true,
  universalIdentifier: personNameFieldId,
  workspaceId,
});

const companyNameField = getFlatFieldMetadataMock({
  id: companyNameFieldId,
  objectMetadataId: companyFlatObject.id,
  type: FieldMetadataType.TEXT,
  icon: 'test-field-icon',
  name: 'name',
  label: 'Name',
  defaultValue: '',
  isCustom: false,
  isNullable: true,
  isUnique: false,
  isLabelSyncedWithName: true,
  universalIdentifier: companyNameFieldId,
  workspaceId,
});

const companyDomainNameField = getFlatFieldMetadataMock({
  id: companyDomainNameFieldId,
  objectMetadataId: companyFlatObject.id,
  type: FieldMetadataType.LINKS,
  icon: 'test-field-icon',
  name: 'domainName',
  label: 'Domain Name',
  defaultValue: {
    primaryLinkLabel: '',
    primaryLinkUrl: '',
    secondaryLinks: [],
  },
  isCustom: false,
  isNullable: true,
  isUnique: false,
  isLabelSyncedWithName: true,
  universalIdentifier: companyDomainNameFieldId,
  workspaceId,
});

const customObjectNameField = getFlatFieldMetadataMock({
  id: customObjectNameFieldId,
  objectMetadataId: customObjectFlatObject.id,
  type: FieldMetadataType.TEXT,
  icon: 'test-field-icon',
  name: 'name',
  label: 'Name',
  defaultValue: '',
  isCustom: false,
  isNullable: true,
  isUnique: false,
  isLabelSyncedWithName: true,
  universalIdentifier: customObjectNameFieldId,
  workspaceId,
});

const customObjectImageField = getFlatFieldMetadataMock({
  id: customObjectImageFieldId,
  objectMetadataId: customObjectFlatObject.id,
  type: FieldMetadataType.TEXT,
  icon: 'test-field-icon',
  name: 'imageIdentifierFieldName',
  label: 'Image Identifier Field Name',
  defaultValue: '',
  isCustom: false,
  isNullable: true,
  isUnique: false,
  isLabelSyncedWithName: true,
  universalIdentifier: customObjectImageFieldId,
  workspaceId,
});

const ALL_FLAT_OBJECTS = [
  personFlatObject,
  companyFlatObject,
  customObjectFlatObject,
  nonSearchableFlatObject,
];

const ALL_FLAT_FIELDS = [
  personNameField,
  companyNameField,
  companyDomainNameField,
  customObjectNameField,
  customObjectImageField,
];

export const mockFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  ALL_FLAT_OBJECTS.reduce(
    (acc, object) => ({
      ...acc,
      byId: {
        ...acc.byId,
        [object.id]: object,
      },
      idByUniversalIdentifier: {
        ...acc.idByUniversalIdentifier,
        [object.universalIdentifier]: object.id,
      },
    }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
  );

export const mockFlatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  ALL_FLAT_FIELDS.reduce(
    (acc, field) => ({
      ...acc,
      byId: {
        ...acc.byId,
        [field.id]: field,
      },
      idByUniversalIdentifier: {
        ...acc.idByUniversalIdentifier,
        [field.universalIdentifier]: field.id,
      },
    }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
  );

export const mockObjectIdByNameSingular: Record<string, string> =
  ALL_FLAT_OBJECTS.reduce(
    (acc, object) => ({
      ...acc,
      [object.nameSingular]: object.id,
    }),
    {} as Record<string, string>,
  );

export const getMockObjectMetadataInfo = (
  nameSingular: string,
): ObjectMetadataInfo => {
  const objectId = mockObjectIdByNameSingular[nameSingular];
  const flatObjectMetadata = mockFlatObjectMetadataMaps.byId[objectId];

  if (!flatObjectMetadata) {
    throw new Error(
      `Object metadata not found for nameSingular: ${nameSingular}`,
    );
  }

  return {
    flatObjectMetadata,
    flatObjectMetadataMaps: mockFlatObjectMetadataMaps,
    flatFieldMetadataMaps: mockFlatFieldMetadataMaps,
  };
};

export const mockPersonObjectMetadataInfo = getMockObjectMetadataInfo('person');
export const mockCompanyObjectMetadataInfo =
  getMockObjectMetadataInfo('company');
export const mockCustomObjectMetadataInfo = getMockObjectMetadataInfo(
  'regular-custom-object',
);
export const mockNonSearchableObjectMetadataInfo = getMockObjectMetadataInfo(
  'non-searchable-object',
);
