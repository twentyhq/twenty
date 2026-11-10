import { DataSource } from 'typeorm';

import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';

export const createIndexBuildDataSource = async ({
  dataSource,
}: {
  dataSource: DataSource;
}): Promise<DataSource> => {
  const coreDataSourceOptions = dataSource.options;

  if (coreDataSourceOptions.type !== 'postgres') {
    throw new WorkspaceSchemaManagerException(
      `Concurrent index builds need a postgres datasource, got ${coreDataSourceOptions.type}`,
      WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }

  return new DataSource({
    ...coreDataSourceOptions,
    entities: [],
    migrations: [],
    subscribers: [],
    poolSize: 1,
    extra: { ...coreDataSourceOptions.extra, query_timeout: undefined },
  }).initialize();
};
