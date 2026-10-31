import { type QueryRunner } from 'typeorm';

import { type WorkspaceSchemaIndexDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-index-definition.type';
import { type WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';

// Below this, a plain index build takes milliseconds, so it skips the database-wide waits of CONCURRENTLY
const CONCURRENT_INDEX_MIN_TABLE_SIZE_IN_BYTES = 8 * 1024 * 1024;

// An interrupted CREATE INDEX CONCURRENTLY leaves an invalid index that IF NOT EXISTS would keep
export const createMissingIndexes = async ({
  indexManager,
  queryRunner,
  schemaName,
  tableName,
  tableSizeInBytes,
  indexDefinitions,
  indexValidityByName,
}: {
  indexManager: WorkspaceSchemaIndexManagerService;
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
  tableSizeInBytes: number;
  indexDefinitions: WorkspaceSchemaIndexDefinition[];
  indexValidityByName: Map<string, boolean>;
}): Promise<void> => {
  const concurrently =
    tableSizeInBytes >= CONCURRENT_INDEX_MIN_TABLE_SIZE_IN_BYTES;

  for (const indexDefinition of indexDefinitions) {
    const isValid = indexValidityByName.get(indexDefinition.name);

    if (isValid === true) {
      continue;
    }

    if (isValid === false) {
      await indexManager.dropIndex({
        queryRunner,
        schemaName,
        indexName: indexDefinition.name,
        concurrently,
      });
    }

    await indexManager.createIndex({
      queryRunner,
      schemaName,
      tableName,
      index: indexDefinition,
      concurrently,
    });
  }
};
