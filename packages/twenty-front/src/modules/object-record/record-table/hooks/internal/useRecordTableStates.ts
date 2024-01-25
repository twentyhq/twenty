import { isRowSelectedFamilyStateScopeMap } from '@/object-record/record-table/record-table-row/states/isRowSelectedFamilyStateScopeMap';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { availableTableColumnsStateScopeMap } from '@/object-record/record-table/states/availableTableColumnsStateScopeMap';
import { currentTableCellInEditModePositionStateScopeMap } from '@/object-record/record-table/states/currentTableCellInEditModePositionStateScopeMap';
import { isRecordTableInitialLoadingStateScopeMap } from '@/object-record/record-table/states/isRecordTableInitialLoadingStateScopeMap';
import { isSoftFocusActiveStateScopeMap } from '@/object-record/record-table/states/isSoftFocusActiveStateScopeMap';
import { isSoftFocusOnTableCellFamilyStateScopeMap } from '@/object-record/record-table/states/isSoftFocusOnTableCellFamilyStateScopeMap';
import { isTableCellInEditModeFamilyStateScopeMap } from '@/object-record/record-table/states/isTableCellInEditModeFamilyStateScopeMap';
import { numberOfTableRowsStateScopeMap } from '@/object-record/record-table/states/numberOfTableRowsStateScopeMap';
import { objectMetadataConfigStateScopeMap } from '@/object-record/record-table/states/objectMetadataConfigStateScopeMap';
import { onColumnsChangeStateScopeMap } from '@/object-record/record-table/states/onColumnsChangeStateScopeMap';
import { onEntityCountChangeStateScopeMap } from '@/object-record/record-table/states/onEntityCountChangeStateScopeMap';
import { resizeFieldOffsetStateScopeMap } from '@/object-record/record-table/states/resizeFieldOffsetStateScopeMap';
import { allRowsSelectedStatusSelectorScopeMap } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusSelectorScopeMap';
import { hiddenTableColumnsSelectorScopeMap } from '@/object-record/record-table/states/selectors/hiddenTableColumnsSelectorScopeMap';
import { numberOfTableColumnsSelectorScopeMap } from '@/object-record/record-table/states/selectors/numberOfTableColumnsSelectorScopeMap';
import { selectedRowIdsSelectorScopeMap } from '@/object-record/record-table/states/selectors/selectedRowIdsSelectorScopeMap';
import { tableColumnsByKeySelectorScopeMap } from '@/object-record/record-table/states/selectors/tableColumnsByKeySelectorScopeMap';
import { visibleTableColumnsSelectorScopeMap } from '@/object-record/record-table/states/selectors/visibleTableColumnsSelectorScopeMap';
import { softFocusPositionStateScopeMap } from '@/object-record/record-table/states/softFocusPositionStateScopeMap';
import { tableColumnsStateScopeMap } from '@/object-record/record-table/states/tableColumnsStateScopeMap';
import { tableFiltersStateScopeMap } from '@/object-record/record-table/states/tableFiltersStateScopeMap';
import { tableLastRowVisibleStateScopeMap } from '@/object-record/record-table/states/tableLastRowVisibleStateScopeMap';
import { tableRowIdsStateScopeMap } from '@/object-record/record-table/states/tableRowIdsStateScopeMap';
import { tableSortsStateScopeMap } from '@/object-record/record-table/states/tableSortsStateScopeMap';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getFamilyState } from '@/ui/utilities/recoil-scope/utils/getFamilyState';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { getSelector } from '@/ui/utilities/recoil-scope/utils/getSelector';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useRecordTableStates = (recordTableId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordTableId),
  );

  return {
    scopeId,
    getAvailableTableColumnsState: getState(
      availableTableColumnsStateScopeMap,
      scopeId,
    ),
    getTableFiltersState: getState(tableFiltersStateScopeMap, scopeId),
    getTableSortsState: getState(tableSortsStateScopeMap, scopeId),
    getTableColumnsState: getState(tableColumnsStateScopeMap, scopeId),
    getObjectMetadataConfigState: getState(
      objectMetadataConfigStateScopeMap,
      scopeId,
    ),
    getOnColumnsChangeState: getState(onColumnsChangeStateScopeMap, scopeId),
    getOnEntityCountChangeState: getState(
      onEntityCountChangeStateScopeMap,
      scopeId,
    ),
    getTableLastRowVisibleState: getState(
      tableLastRowVisibleStateScopeMap,
      scopeId,
    ),
    getSoftFocusPositionState: getState(
      softFocusPositionStateScopeMap,
      scopeId,
    ),
    getNumberOfTableRowsState: getState(
      numberOfTableRowsStateScopeMap,
      scopeId,
    ),
    getCurrentTableCellInEditModePositionState: getState(
      currentTableCellInEditModePositionStateScopeMap,
      scopeId,
    ),
    isTableCellInEditModeFamilyState: getFamilyState(
      isTableCellInEditModeFamilyStateScopeMap,
      scopeId,
    ),
    getIsSoftFocusActiveState: getState(
      isSoftFocusActiveStateScopeMap,
      scopeId,
    ),
    getTableRowIdsState: getState(tableRowIdsStateScopeMap, scopeId),
    getIsRecordTableInitialLoadingState: getState(
      isRecordTableInitialLoadingStateScopeMap,
      scopeId,
    ),
    getResizeFieldOffsetState: getState(
      resizeFieldOffsetStateScopeMap,
      scopeId,
    ),
    isSoftFocusOnTableCellFamilyState: getFamilyState(
      isSoftFocusOnTableCellFamilyStateScopeMap,
      scopeId,
    ),
    isRowSelectedFamilyState: getFamilyState(
      isRowSelectedFamilyStateScopeMap,
      scopeId,
    ),
    allRowsSelectedStatusSelector: getSelector(
      allRowsSelectedStatusSelectorScopeMap,
      scopeId,
    ),
    hiddenTableColumnsSelector: getSelector(
      hiddenTableColumnsSelectorScopeMap,
      scopeId,
    ),
    numberOfTableColumnsSelector: getSelector(
      numberOfTableColumnsSelectorScopeMap,
      scopeId,
    ),
    selectedRowIdsSelector: getSelector(
      selectedRowIdsSelectorScopeMap,
      scopeId,
    ),
    tableColumnsByKeySelector: getSelector(
      tableColumnsByKeySelectorScopeMap,
      scopeId,
    ),
    visibleTableColumnsSelector: getSelector(
      visibleTableColumnsSelectorScopeMap,
      scopeId,
    ),
  };
};
