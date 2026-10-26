import { type DataSource, type EntityMetadata } from 'typeorm';

import { APPLICATION_TRANSFER_CORE_ENTITIES } from 'src/database/commands/application-transfer/constants/application-transfer-core-entities.constant';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';

export const getApplicationTransferEntityMetadatas = (
  dataSource: DataSource,
): EntityMetadata[] =>
  [
    ...Object.values(ALL_METADATA_ENTITY_BY_METADATA_NAME),
    ...APPLICATION_TRANSFER_CORE_ENTITIES,
  ].map((entity) => dataSource.getMetadata(entity));

export const buildQuotedTablePath = (entityMetadata: EntityMetadata): string =>
  `"${entityMetadata.schema ?? 'core'}"."${entityMetadata.tableName}"`;
