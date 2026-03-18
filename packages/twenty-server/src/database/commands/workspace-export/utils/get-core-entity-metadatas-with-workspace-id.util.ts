import { DataSource } from 'typeorm';

export const getCoreEntityMetadatasWithWorkspaceId = (
  dataSource: DataSource,
) => {
  return dataSource.entityMetadatas.filter((entityMetadata) =>
    entityMetadata.columns.some(
      (column) => column.propertyName === 'workspaceId',
    ),
  );
};
