import { DataSource } from 'typeorm';

import {
  WorkspaceSchemaManagerException,
  WorkspaceSchemaManagerExceptionCode,
} from 'src/engine/twenty-orm/workspace-schema-manager/exceptions/workspace-schema-manager.exception';
import { type WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';

export const createWorkspaceIndexesConcurrently = async ({
  dataSource,
  indexManager,
  indexes,
}: {
  dataSource: DataSource;
  indexManager: WorkspaceSchemaIndexManagerService;
  indexes: {
    schemaName: string;
    tableName: string;
    index: WorkspaceSchemaIndexDefinition;
  }[];
}): Promise<{ droppedInvalidIndexNames: string[] }> => {
  const coreDataSourceOptions = dataSource.options;

  if (coreDataSourceOptions.type !== 'postgres') {
    throw new WorkspaceSchemaManagerException(
      `Concurrent index builds need a postgres datasource, got ${coreDataSourceOptions.type}`,
      WorkspaceSchemaManagerExceptionCode.INTERNAL_SERVER_ERROR,
    );
  }

  const indexBuildDataSource = await new DataSource({
    ...coreDataSourceOptions,
    entities: [],
    migrations: [],
    subscribers: [],
    poolSize: 1,
    extra: { ...coreDataSourceOptions.extra, query_timeout: undefined },
  }).initialize();
  const droppedInvalidIndexNames: string[] = [];

  try {
    const queryRunner = indexBuildDataSource.createQueryRunner();

    await queryRunner.connect();

    for (const { schemaName, tableName, index } of indexes) {
      const invalidIndexes: { name: string }[] = await queryRunner.query(
        `SELECT index_class.relname AS name
         FROM pg_index
         JOIN pg_class index_class ON index_class.oid = pg_index.indexrelid
         JOIN pg_namespace namespace ON namespace.oid = index_class.relnamespace
         WHERE namespace.nspname = $1
           AND index_class.relname = $2
           AND NOT pg_index.indisvalid`,
        [schemaName, index.name],
      );

      if (invalidIndexes.length > 0) {
        await indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: index.name,
        });
        droppedInvalidIndexNames.push(index.name);
      }

      await indexManager.createIndex({
        queryRunner,
        schemaName,
        tableName,
        index,
        concurrently: true,
      });
    }
  } finally {
    await indexBuildDataSource.destroy();
  }

  return { droppedInvalidIndexNames };
};
