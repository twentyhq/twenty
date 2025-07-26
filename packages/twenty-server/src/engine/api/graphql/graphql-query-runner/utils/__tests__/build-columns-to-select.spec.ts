import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { buildColumnsToSelect } from 'src/engine/api/graphql/graphql-query-runner/utils/build-columns-to-select';

describe('buildColumnsToSelect', () => {
  const mockObjectMetadataItemWithFieldMaps: any = {
    id: 'a55d8cad-4c3d-4c8a-82b5-539a36de5605',
    standardId: '20202020-e674-48e5-a542-72570eee7213',
    dataSourceId: 'd161a12f-1daa-4a0b-887c-96a48a3d9ecf',
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
    description: 'A person',
    icon: 'IconUser',
    standardOverrides: null,
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
    labelIdentifierFieldMetadataId: '92414583-c6a6-4c98-bae7-6ce318bd3423',
    imageIdentifierFieldMetadataId: '6bfcecc4-1866-4254-ba6b-6f22246819bb',
    isLabelSyncedWithName: false,
    workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
    createdAt: new Date('2025-07-10T10:58:54.536Z'),
    updatedAt: new Date('2025-07-10T10:58:54.536Z'),
    indexMetadatas: [],
    fieldsById: {
      '92414583-c6a6-4c98-bae7-6ce318bd3423': {
        id: '92414583-c6a6-4c98-bae7-6ce318bd3423',
        type: FieldMetadataType.FULL_NAME,
        name: 'name',
        label: 'Name',
        defaultValue: {
          lastName: "''",
          firstName: "''",
        },
        description: "Contact's name",
        icon: 'IconUser',
        standardOverrides: null,
        options: undefined,
        settings: undefined,
        isCustom: false,
        isActive: true,
        isSystem: false,
        isNullable: true,
        isUnique: false,
        workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        isLabelSyncedWithName: true,
        relationTargetFieldMetadataId: undefined,
        relationTargetObjectMetadataId: undefined,
        objectMetadataId: 'a55d8cad-4c3d-4c8a-82b5-539a36de5605',
        createdAt: new Date('2025-07-10T10:58:54.536Z'),
        updatedAt: new Date('2025-07-10T10:58:54.536Z'),
      },
      '30dc1370-bb1a-42e3-abbc-a40edf1c6796': {
        id: '30dc1370-bb1a-42e3-abbc-a40edf1c6796',
        type: FieldMetadataType.RELATION,
        name: 'company',
        label: 'Company',
        defaultValue: null,
        description: "Contact's company",
        icon: 'IconBuildingSkyscraper',
        standardOverrides: null,
        options: undefined,
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          joinColumnName: 'companyId',
        },
        isCustom: false,
        isActive: true,
        isSystem: false,
        isNullable: true,
        isUnique: false,
        workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
        isLabelSyncedWithName: true,
        relationTargetFieldMetadataId: '83cd9e7f-dfbc-4b93-a0a7-4c04b76d2009',
        relationTargetObjectMetadataId: '9af20778-2f2c-4e22-ae83-2e77e479b57c',
        objectMetadataId: 'a55d8cad-4c3d-4c8a-82b5-539a36de5605',
        createdAt: new Date('2025-07-10T10:58:54.536Z'),
        updatedAt: new Date('2025-07-10T10:58:54.536Z'),
      },
    },
    fieldIdByName: {
      name: '92414583-c6a6-4c98-bae7-6ce318bd3423',
      company: '30dc1370-bb1a-42e3-abbc-a40edf1c6796',
    },
    fieldIdByJoinColumnName: {
      companyId: '30dc1370-bb1a-42e3-abbc-a40edf1c6796',
    },
  };

  it('should build columns to select with relation fields', () => {
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
      objectMetadataItemWithFieldMaps: mockObjectMetadataItemWithFieldMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      companyId: true,
      id: true,
    });
  });

  it('should build columns to select without relation fields', () => {
    const select = {
      nameFirstName: true,
      nameLastName: true,
    };

    const relations = {};

    const result = buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps: mockObjectMetadataItemWithFieldMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      nameLastName: true,
      id: true,
    });
  });

  it('should filter out non-boolean values from select', () => {
    const select = {
      nameFirstName: true,
      nameLastName: false,
      company: { id: true },
    };

    const relations = {};

    const result = buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps: mockObjectMetadataItemWithFieldMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });

  it('should handle relation field that is not a relation type', () => {
    const select = {
      nameFirstName: true,
    };

    const relations = {
      name: {}, // This is not a relation field
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps: mockObjectMetadataItemWithFieldMaps,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });

  it('should handle relation field that is not MANY_TO_ONE', () => {
    const mockObjectMetadataWithOneToMany: any = {
      ...mockObjectMetadataItemWithFieldMaps,
      fieldsById: {
        ...mockObjectMetadataItemWithFieldMaps.fieldsById,
        '30dc1370-bb1a-42e3-abbc-a40edf1c6796': {
          ...mockObjectMetadataItemWithFieldMaps.fieldsById[
            '30dc1370-bb1a-42e3-abbc-a40edf1c6796'
          ],
          settings: {
            relationType: RelationType.ONE_TO_MANY,
            joinColumnName: 'companyId',
          },
        },
      },
    };

    const select = {
      nameFirstName: true,
    };

    const relations = {
      company: {},
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps: mockObjectMetadataWithOneToMany,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });

  it('should handle relation field without joinColumnName', () => {
    const mockObjectMetadataWithoutJoinColumn: any = {
      ...mockObjectMetadataItemWithFieldMaps,
      fieldsById: {
        ...mockObjectMetadataItemWithFieldMaps.fieldsById,
        '30dc1370-bb1a-42e3-abbc-a40edf1c6796': {
          ...mockObjectMetadataItemWithFieldMaps.fieldsById[
            '30dc1370-bb1a-42e3-abbc-a40edf1c6796'
          ],
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: null,
          },
        },
      },
    };

    const select = {
      nameFirstName: true,
    };

    const relations = {
      company: {},
    };

    const result = buildColumnsToSelect({
      select,
      relations,
      objectMetadataItemWithFieldMaps: mockObjectMetadataWithoutJoinColumn,
    });

    expect(result).toEqual({
      nameFirstName: true,
      id: true,
    });
  });
});
