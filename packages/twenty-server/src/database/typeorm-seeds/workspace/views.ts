import { DataSource } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const seedViews = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  const createdViews = await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, [
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
    ])
    .values([
      {
        name: 'All Companies',
        objectMetadataId: objectMetadataMap['company'].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconBuildingSkyscraper',
      },
      {
        name: 'All People',
        objectMetadataId: objectMetadataMap['person'].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconUser',
      },
      {
        name: 'By Stage',
        objectMetadataId: objectMetadataMap['opportunity'].id,
        type: 'kanban',
        key: null,
        position: 0,
        icon: 'IconLayoutKanban',
      },
      {
        name: 'All Opportunities',
        objectMetadataId: objectMetadataMap['opportunity'].id,
        type: 'table',
        key: 'INDEX',
        position: 1,
        icon: 'IconTargetArrow',
      },
    ])
    .returning('*')
    .execute();

  const viewIdMap = createdViews.raw.reduce((acc, view) => {
    acc[`${view.name}`] = view.id;

    return acc;
  }, {});

  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.viewField`, [
      'fieldMetadataId',
      'viewId',
      'position',
      'isVisible',
      'size',
    ])
    .values([
      {
        fieldMetadataId: objectMetadataMap['company'].fields['name'],
        viewId: viewIdMap['All Companies'],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['domainName'],
        viewId: viewIdMap['All Companies'],
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['accountOwner'],
        viewId: viewIdMap['All Companies'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['createdAt'],
        viewId: viewIdMap['All Companies'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['employees'],
        viewId: viewIdMap['All Companies'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['linkedinLink'],
        viewId: viewIdMap['All Companies'],
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['address'],
        viewId: viewIdMap['All Companies'],
        position: 6,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['name'],
        viewId: viewIdMap['All People'],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['email'],
        viewId: viewIdMap['All People'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['company'],
        viewId: viewIdMap['All People'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['phone'],
        viewId: viewIdMap['All People'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['createdAt'],
        viewId: viewIdMap['All People'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['city'],
        viewId: viewIdMap['All People'],
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['jobTitle'],
        viewId: viewIdMap['All People'],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['linkedinLink'],
        viewId: viewIdMap['All People'],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['xLink'],
        viewId: viewIdMap['All People'],
        position: 8,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['name'],
        viewId: viewIdMap['All Opportunities'],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['amount'],
        viewId: viewIdMap['All Opportunities'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['closeDate'],
        viewId: viewIdMap['All Opportunities'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['probability'],
        viewId: viewIdMap['All Opportunities'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap['opportunity'].fields['pointOfContact'],
        viewId: viewIdMap['All Opportunities'],
        position: 4,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['name'],
        viewId: viewIdMap['By Stage'],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['amount'],
        viewId: viewIdMap['By Stage'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['closeDate'],
        viewId: viewIdMap['By Stage'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['probability'],
        viewId: viewIdMap['By Stage'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap['opportunity'].fields['pointOfContact'],
        viewId: viewIdMap['By Stage'],
        position: 4,
        isVisible: true,
        size: 150,
      },
    ])
    .execute();
};
