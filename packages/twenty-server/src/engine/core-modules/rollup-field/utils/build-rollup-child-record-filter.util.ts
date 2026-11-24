import {
  type FieldMetadataRollupSettings,
  type RecordGqlOperationFilter,
  RecordFilterGroupLogicalOperator,
  ViewFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { convertViewFilterValueToString } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeRecordGqlOperationFilterFromFlatMaps } from 'src/engine/utils/compute-record-gql-operation-filter-from-flat-maps.util';

export const buildRollupChildRecordFilter = ({
  settings: { filters, filterGroups },
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  settings: Pick<FieldMetadataRollupSettings, 'filters' | 'filterGroups'>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): RecordGqlOperationFilter =>
  computeRecordGqlOperationFilterFromFlatMaps({
    filterValueDependencies: {},
    recordFilters: filters.map((filter) => ({
      fieldMetadataId: filter.fieldMetadataId,
      value: convertViewFilterValueToString(filter.value),
      recordFilterGroupId: filter.filterGroupId,
      operand: filter.operand,
      subFieldName: null,
    })),
    recordFilterGroups: filterGroups.map((filterGroup) => ({
      id: filterGroup.id,
      parentRecordFilterGroupId: filterGroup.parentFilterGroupId,
      logicalOperator:
        filterGroup.logicalOperator === ViewFilterGroupLogicalOperator.OR
          ? RecordFilterGroupLogicalOperator.OR
          : RecordFilterGroupLogicalOperator.AND,
    })),
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });
