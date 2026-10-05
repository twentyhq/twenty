import { type IndexedColumn } from 'src/engine/api/common/common-query-runners/types/indexed-column.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RowsEstimationContext = {
  flatObjectMetadata: FlatObjectMetadata;
  recordCount: number;
  indexedColumnByName: Map<string, IndexedColumn>;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  approximateRecordCountByTableName: Map<string, number>;
};
