import { DataSource } from 'typeorm';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export const seedViews = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  const createdViews = await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, ['name', 'objectMetadataId', 'type'])
    .values([
      {
        name: 'همه شرکت ها',
        objectMetadataId: objectMetadataMap['company'].id,
        type: 'table',
      },
      {
        name: 'همه افراد',
        objectMetadataId: objectMetadataMap['person'].id,
        type: 'table',
      },
      {
        name: 'همه فرصت ها',
        objectMetadataId: objectMetadataMap['opportunity'].id,
        type: 'kanban',
      },
    ])
    .returning('*')
    .execute();

  const viewIdMap = createdViews.raw.reduce((acc, view) => {
    acc[view.name] = view.id;

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
        viewId: viewIdMap['همه شرکت ها'],
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['domainName'],
        viewId: viewIdMap['همه شرکت ها'],
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['accountOwner'],
        viewId: viewIdMap['همه شرکت ها'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['createdAt'],
        viewId: viewIdMap['همه شرکت ها'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['employees'],
        viewId: viewIdMap['همه شرکت ها'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['linkedinLink'],
        viewId: viewIdMap['همه شرکت ها'],
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: objectMetadataMap['company'].fields['address'],
        viewId: viewIdMap['همه شرکت ها'],
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
        viewId: viewIdMap['همه افراد'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['company'],
        viewId: viewIdMap['همه افراد'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['phone'],
        viewId: viewIdMap['همه افراد'],
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['createdAt'],
        viewId: viewIdMap['همه افراد'],
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['city'],
        viewId: viewIdMap['همه افراد'],
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['jobTitle'],
        viewId: viewIdMap['همه افراد'],
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['linkedinLink'],
        viewId: viewIdMap['همه افراد'],
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['person'].fields['xLink'],
        viewId: viewIdMap['همه افراد'],
        position: 8,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['amount'],
        viewId: viewIdMap['همه فرصت ها'],
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['closeDate'],
        viewId: viewIdMap['همه فرصت ها'],
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: objectMetadataMap['opportunity'].fields['probability'],
        viewId: viewIdMap['همه فرصت ها'],
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          objectMetadataMap['opportunity'].fields['pointOfContact'],
        viewId: viewIdMap['همه فرصت ها'],
        position: 3,
        isVisible: true,
        size: 150,
      },
    ])
    .execute();
};
