import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewSortFieldMetadataIds {
  Id = '20202020-5870-4665-92a6-a39b7f53352d',
  CreatedAt = '20202020-7677-4955-8ffe-06481534d12c',
  UpdatedAt = '20202020-16ec-4074-a54b-c8f7f1178cf6',

  FieldMetadataId = '20202020-cb2c-4c8f-a289-c9851b23d064',
  View = '20202020-f5d0-467f-a3d8-395ba16b8ebf',
  ViewForeignKey = '20202020-c852-4c28-b13a-07788c845d6c',
  Direction = '20202020-077e-4451-b1d8-e602c956ebd2',
}

export const seedViewSortFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${fieldMetadataTableName}`, [
      'id',
      'objectMetadataId',
      'isCustom',
      'workspaceId',
      'isActive',
      'type',
      'name',
      'label',
      'targetColumnMap',
      'description',
      'icon',
      'isNullable',
      'isSystem',
      'defaultValue',
    ])
    .orIgnore()
    .values([
      // Default fields
      {
        id: SeedViewSortFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'id',
        label: 'Id',
        targetColumnMap: {
          value: 'id',
        },
        description: undefined,
        icon: undefined,
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'uuid' },
      },
      {
        id: SeedViewSortFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE_TIME,
        name: 'createdAt',
        label: 'Creation date',
        targetColumnMap: {
          value: 'createdAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'now' },
      },
      {
        id: SeedViewSortFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.DATE_TIME,
        name: 'updatedAt',
        label: 'Update date',
        targetColumnMap: {
          value: 'updatedAt',
        },
        description: undefined,
        icon: 'IconCalendar',
        isNullable: false,
        isSystem: true,
        defaultValue: { type: 'now' },
      },
      // Fields
      {
        id: SeedViewSortFieldMetadataIds.FieldMetadataId,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'fieldMetadataId',
        label: 'Field Metadata Id',
        targetColumnMap: {
          value: 'fieldMetadataId',
        },
        description: 'View Sort target field',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewSortFieldMetadataIds.View,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'view',
        label: 'View',
        targetColumnMap: {},
        description: 'View Sort related view',
        icon: 'IconLayoutCollage',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewSortFieldMetadataIds.ViewForeignKey,
        objectMetadataId: SeedObjectMetadataIds.ViewField,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'viewId',
        label: 'View ID (foreign key)',
        targetColumnMap: {},
        description: 'Foreign key for view',
        icon: undefined,
        isNullable: false,
        isSystem: true,
        defaultValue: undefined,
      },
      {
        id: SeedViewSortFieldMetadataIds.Direction,
        objectMetadataId: SeedObjectMetadataIds.ViewSort,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'direction',
        label: 'Direction',
        targetColumnMap: {
          value: 'direction',
        },
        description: 'View Sort direction',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: { value: 'asc' },
      },
    ])
    .execute();
};
