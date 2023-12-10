import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { SeedWorkspaceId } from 'src/database/typeorm-seeds/core/workspaces';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedViewFilterFieldMetadataIds {
  Id = '20202020-353c-4fb0-9011-1ad8e1dd67f9',
  CreatedAt = '20202020-da57-452d-9671-ab3ccac2a9da',
  UpdatedAt = '20202020-96c9-4cf1-87b4-8a009c591a16',

  FieldMetadataId = '20202020-78bb-4f2b-a052-260bc8efd694',
  View = '20202020-65e5-4082-829d-8c634c20e7b5',
  ViewForeignKey = '20202020-c852-4c28-b13a-07788c845d6b',
  Operand = '20202020-1d12-465d-ab2c-8af008182730',
  Value = '20202020-8b37-46ae-86b8-14287ec06802',
  DisplayValue = '20202020-ed89-4892-83fa-d2b2929c6d52',
}

export const seedViewFilterFieldMetadata = async (
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
        id: SeedViewFilterFieldMetadataIds.Id,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
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
        id: SeedViewFilterFieldMetadataIds.CreatedAt,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
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
        id: SeedViewFilterFieldMetadataIds.UpdatedAt,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
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
        id: SeedViewFilterFieldMetadataIds.FieldMetadataId,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.UUID,
        name: 'fieldMetadataId',
        label: 'Field Metadata Id',
        targetColumnMap: {
          value: 'fieldMetadataId',
        },
        description: 'View Filter target field',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewFilterFieldMetadataIds.View,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.RELATION,
        name: 'view',
        label: 'View',
        targetColumnMap: {},
        description: 'View Filter related view',
        icon: 'IconLayoutCollage',
        isNullable: true,
        isSystem: false,
        defaultValue: undefined,
      },
      {
        id: SeedViewFilterFieldMetadataIds.ViewForeignKey,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
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
        id: SeedViewFilterFieldMetadataIds.Operand,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'operand',
        label: 'Operand',
        targetColumnMap: {
          value: 'operand',
        },
        description: 'View Filter operand',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: { value: 'Contains' },
      },
      {
        id: SeedViewFilterFieldMetadataIds.Value,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'value',
        label: 'Value',
        targetColumnMap: {
          value: 'value',
        },
        description: 'View Filter value',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: { value: '' },
      },
      {
        id: SeedViewFilterFieldMetadataIds.DisplayValue,
        objectMetadataId: SeedObjectMetadataIds.ViewFilter,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: FieldMetadataType.TEXT,
        name: 'displayValue',
        label: 'Display Value',
        targetColumnMap: {
          value: 'displayValue',
        },
        description: 'View Filter Display Value',
        icon: null,
        isNullable: false,
        isSystem: false,
        defaultValue: { value: '' },
      },
    ])
    .execute();
};
