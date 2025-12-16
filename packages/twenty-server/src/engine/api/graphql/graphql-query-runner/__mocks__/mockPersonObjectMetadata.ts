import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const objectMetadataId = 'person-object-id';

const mockFieldMetadatas: FlatFieldMetadata[] = [
  {
    id: 'name-id',
    type: FieldMetadataType.FULL_NAME,
    name: 'name',
    label: 'Name',
    defaultValue: {
      lastName: "''",
      firstName: "''",
    },
    objectMetadataId,
    isNullable: true,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'name-id',
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  } as unknown as FlatFieldMetadata,
  {
    id: 'emails-id',
    type: FieldMetadataType.EMAILS,
    name: 'emails',
    label: 'Emails',
    defaultValue: {
      primaryEmail: "''",
      additionalEmails: null,
    },
    objectMetadataId,
    isNullable: true,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'emails-id',
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  } as unknown as FlatFieldMetadata,
  {
    id: 'linkedinLink-id',
    type: FieldMetadataType.LINKS,
    name: 'linkedinLink',
    label: 'Linkedin',
    defaultValue: {
      primaryLinkUrl: "''",
      secondaryLinks: [],
      primaryLinkLabel: "''",
    },
    objectMetadataId,
    isNullable: true,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'linkedinLink-id',
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  } as unknown as FlatFieldMetadata,
  {
    id: 'jobTitle-id',
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
    label: 'Job Title',
    defaultValue: "''",
    objectMetadataId,
    isNullable: false,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    universalIdentifier: 'jobTitle-id',
    viewFieldIds: [],
    viewFilterIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    applicationId: null,
  } as unknown as FlatFieldMetadata,
];

export const mockPersonFlatFieldMetadataMaps =
  (): FlatEntityMaps<FlatFieldMetadata> => ({
    byId: mockFieldMetadatas.reduce(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    idByUniversalIdentifier: mockFieldMetadatas.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field.id;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

export const mockPersonFlatObjectMetadataMaps = (
  duplicateCriteria: WorkspaceEntityDuplicateCriteria[],
): FlatEntityMaps<FlatObjectMetadata> => {
  const flatObjectMetadata = mockPersonFlatObjectMetadata(duplicateCriteria);

  return {
    byId: {
      [flatObjectMetadata.id]: flatObjectMetadata,
    },
    idByUniversalIdentifier: {
      [flatObjectMetadata.universalIdentifier as string]: flatObjectMetadata.id,
    },
    universalIdentifiersByApplicationId: {},
  };
};

export const mockPersonFlatObjectMetadata = (
  duplicateCriteria: WorkspaceEntityDuplicateCriteria[],
): FlatObjectMetadata =>
  ({
    id: objectMetadataId,
    icon: 'Icon123',
    standardId: '',
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    targetTableName: 'person',
    isCustom: false,
    isRemote: false,
    isActive: true,
    isSystem: false,
    isAuditLogged: true,
    isSearchable: true,
    duplicateCriteria: duplicateCriteria,
    labelIdentifierFieldMetadataId: '',
    imageIdentifierFieldMetadataId: '',
    workspaceId,
    universalIdentifier: objectMetadataId,
    indexMetadataIds: [],
    fieldMetadataIds: mockFieldMetadatas.map((field) => field.id),
    viewIds: [],
    applicationId: null,
    isLabelSyncedWithName: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    shortcut: null,
    description: null,
    standardOverrides: null,
    isUIReadOnly: false,
  }) as FlatObjectMetadata;
