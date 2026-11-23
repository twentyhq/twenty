import {
  type FieldMetadataRollupSettings,
  type RecordGqlOperationFilter,
  RecordFilterGroupLogicalOperator,
  ViewFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  convertViewFilterValueToString,
  getFieldMetadataValueType,
} from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const buildRollupChildRecordFilter = ({
  settings: { filters, filterGroups },
  filterFlatFieldMetadatas,
}: {
  settings: Pick<FieldMetadataRollupSettings, 'filters' | 'filterGroups'>;
  filterFlatFieldMetadatas: Pick<
    OrmFlatFieldMetadata,
    'id' | 'name' | 'label' | 'type' | 'settings'
  >[];
}): RecordGqlOperationFilter =>
  computeRecordGqlOperationFilter({
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
    fieldMetadataItems: filterFlatFieldMetadatas.map((flatFieldMetadata) => ({
      id: flatFieldMetadata.id,
      name: flatFieldMetadata.name,
      label: flatFieldMetadata.label,
      type: getFieldMetadataValueType(flatFieldMetadata),
    })),
  });
