import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

describe('buildColumnsToSelect', () => {
  const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const personObjectId = 'a55d8cad-4c3d-4c8a-82b5-539a36de5605';
  const companyObjectId = '9af20778-2f2c-4e22-ae83-2e77e479b57c';

  const nameFieldId = '92414583-c6a6-4c98-bae7-6ce318bd3423';
  const companyFieldId = '30dc1370-bb1a-42e3-abbc-a40edf1c6796';

  const createMockField = (
    overrides: Partial<FlatFieldMetadata> & {
      id: string;
      name: string;
      type: FieldMetadataType;
      objectMetadataId: string;
    },
  ): FlatFieldMetadata =>
    ({
      workspaceId,
      isNullable: true,
      isLabelSyncedWithName: true,
      createdAt: new Date('2025-07-10T10:58:54.536Z'),
      updatedAt: new Date('2025-07-10T10:58:54.536Z'),
      universalIdentifier: overrides.id,
      viewFieldIds: [],
      viewFilterIds: [],
      kanbanAggregateOperationViewIds: [],
      calendarViewIds: [],
      applicationId: null,
      label: overrides.name,
      isCustom: false,
      isActive: true,
      isSystem: false,
      isUnique: false,
      ...overrides,
    }) as FlatFieldMetadata;

  const nameField = createMockField({
    id: nameFieldId,
    type: FieldMetadataType.FULL_NAME,
    name: 'name',
    label: 'Name',
    objectMetadataId: personObjectId,
    defaultValue: {
      lastName: "''",
      firstName: "''",
    },
    description: "Contact's name",
    icon: 'IconUser',
  });

  const companyRelationField = createMockField({
    id: companyFieldId,
    type: FieldMetadataType.RELATION,
    name: 'company',
    label: 'Company',
    objectMetadataId: personObjectId,
    defaultValue: null,
    description: "Contact's company",
    icon: 'IconBuildingSkyscraper',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'companyId',
    },
    relationTargetFieldMetadataId: '83cd9e7f-dfbc-4b93-a0a7-4c04b76d2009',
    relationTargetObjectMetadataId: companyObjectId,
  });

  const buildMockFlatObjectMetadata = (
    fieldIds: string[],
  ): FlatObjectMetadata =>
    ({
      id: personObjectId,
      standardId: '20202020-e674-48e5-a542-72570eee7213',
      nameSingular: 'person',
      namePlural: 'people',
      labelSingular: 'Person',
      labelPlural: 'People',
      description: 'A person',
      icon: 'IconUser',
      targetTableName: 'DEPRECATED',
      isCustom: false,
      isRemote: false,
      isActive: true,
      isSystem: false,
      isAuditLogged: true,
      isSearchable: true,
      duplicateCriteria: [
        ['nameFirstName', 'nameLastName'],
        ['linkedinLinkPrimaryLinkUrl'],
        ['emailsPrimaryEmail'],
      ],
      shortcut: 'P',
      labelIdentifierFieldMetadataId: nameFieldId,
      imageIdentifierFieldMetadataId: '6bfcecc4-1866-4254-ba6b-6f22246819bb',
      isLabelSyncedWithName: false,
      workspaceId,
      createdAt: new Date('2025-07-10T10:58:54.536Z'),
      updatedAt: new Date('2025-07-10T10:58:54.536Z'),
      universalIdentifier: personObjectId,
      fieldMetadataIds: fieldIds,
      indexMetadataIds: [],
      viewIds: [],
      applicationId: null,
    }) as unknown as FlatObjectMetadata;

  const buildFlatFieldMetadataMaps = (
    fields: FlatFieldMetadata[],
  ): FlatEntityMaps<FlatFieldMetadata> => ({
    byId: fields.reduce(
      (acc, field) => {
        acc[field.id] = field;

        return acc;
      },
      {} as Record<string, FlatFieldMetadata>,
    ),
    idByUniversalIdentifier: fields.reduce(
      (acc, field) => {
        acc[field.universalIdentifier] = field.id;

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  const buildFlatObjectMetadataMaps = (
    objects: FlatObjectMetadata[],
  ): FlatEntityMaps<FlatObjectMetadata> => ({
    byId: objects.reduce(
      (acc, obj) => {
        acc[obj.id] = obj;

        return acc;
      },
      {} as Record<string, FlatObjectMetadata>,
    ),
    idByUniversalIdentifier: objects.reduce(
      (acc, obj) => {
        if (obj.universalIdentifier) {
          acc[obj.universalIdentifier] = obj.id;
        }

        return acc;
      },
      {} as Record<string, string>,
    ),
    universalIdentifiersByApplicationId: {},
  });

  const companyObjectMetadata: FlatObjectMetadata = {
    id: companyObjectId,
    nameSingular: 'company',
    namePlural: 'companies',
    fieldMetadataIds: [],
    indexMetadataIds: [],
    viewIds: [],
  } as unknown as FlatObjectMetadata;

  it('should build columns to select with relation fields', () => {
    const flatObjectMetadata = buildMockFlatObjectMetadata([
      nameFieldId,
      companyFieldId,
    ]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      companyRelationField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      flatObjectMetadata,
      companyObjectMetadata,
    ]);

    const select = {
      nameFirstName: true,
      company: {
        id: true,
        name: true,
      },
    };

    const relations = {
      company: {},
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      companyId: true,
      id: true,
    });
  });

  it('should build columns to select without relation fields', () => {
    const flatObjectMetadata = buildMockFlatObjectMetadata([
      nameFieldId,
      companyFieldId,
    ]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      companyRelationField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      flatObjectMetadata,
      companyObjectMetadata,
    ]);

    const select = {
      nameFirstName: true,
      nameLastName: true,
    };

    const relations = {};

    const result = buildColumnsToSelect({
      select,
      relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      nameLastName: true,
      id: true,
    });
  });

  it('should filter out non-boolean values from select', () => {
    const flatObjectMetadata = buildMockFlatObjectMetadata([
      nameFieldId,
      companyFieldId,
    ]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      companyRelationField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      flatObjectMetadata,
      companyObjectMetadata,
    ]);

    const select = {
      nameFirstName: true,
      nameLastName: false,
      company: { id: true },
    };

    const relations = {};

    const result = buildColumnsToSelect({
      select,
      relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });

  it('should handle relation field that is not a relation type', () => {
    const flatObjectMetadata = buildMockFlatObjectMetadata([
      nameFieldId,
      companyFieldId,
    ]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      companyRelationField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      flatObjectMetadata,
      companyObjectMetadata,
    ]);

    const select = {
      nameFirstName: true,
    };

    const relations = {
      name: {}, // This is not a relation field
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });

  it('should handle relation field that is not MANY_TO_ONE', () => {
    const oneToManyCompanyField = createMockField({
      id: companyFieldId,
      type: FieldMetadataType.RELATION,
      name: 'company',
      label: 'Company',
      objectMetadataId: personObjectId,
      defaultValue: null,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        joinColumnName: 'companyId',
      },
      relationTargetObjectMetadataId: companyObjectId,
    });

    const flatObjectMetadata = buildMockFlatObjectMetadata([
      nameFieldId,
      companyFieldId,
    ]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      oneToManyCompanyField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      flatObjectMetadata,
      companyObjectMetadata,
    ]);

    const select = {
      nameFirstName: true,
    };

    const relations = {
      company: {},
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });

  it('should handle relation field without joinColumnName', () => {
    const noJoinColumnCompanyField = createMockField({
      id: companyFieldId,
      type: FieldMetadataType.RELATION,
      name: 'company',
      label: 'Company',
      objectMetadataId: personObjectId,
      defaultValue: null,
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName: null,
      },
      relationTargetObjectMetadataId: companyObjectId,
    });

    const flatObjectMetadata = buildMockFlatObjectMetadata([
      nameFieldId,
      companyFieldId,
    ]);
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
      nameField,
      noJoinColumnCompanyField,
    ]);
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps([
      flatObjectMetadata,
      companyObjectMetadata,
    ]);

    const select = {
      nameFirstName: true,
    };

    const relations = {
      company: {},
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });
});
