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
import { objectNamePluralStateScopeMap } from '@/object-record/record-table/states/objectNamePluralStateScopeMap';
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
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';
import { getSelector } from '@/ui/utilities/recoil-scope/utils/getSelector';
import { getState } from '@/ui/utilities/recoil-scope/utils/getState';

export const useRecordTableStates = (recordTableId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    getScopeIdFromComponentId(recordTableId),
  );

  return {
    scopeId,
    availableTableColumnsState: getState(
      availableTableColumnsStateScopeMap,
      scopeId,
    ),
    tableFiltersState: getState(tableFiltersStateScopeMap, scopeId),
    tableSortsState: getState(tableSortsStateScopeMap, scopeId),
    tableColumnsState: getState(tableColumnsStateScopeMap, scopeId),
    objectMetadataConfigState: getState(
      objectMetadataConfigStateScopeMap,
      scopeId,
    ),
    objectNamePluralState: getState(objectNamePluralStateScopeMap, scopeId),
    onColumnsChangeState: getState(onColumnsChangeStateScopeMap, scopeId),
    onEntityCountChangeState: getState(
      onEntityCountChangeStateScopeMap,
      scopeId,
    ),
    tableLastRowVisibleState: getState(
      tableLastRowVisibleStateScopeMap,
      scopeId,
    ),
    softFocusPositionState: getState(softFocusPositionStateScopeMap, scopeId),
    numberOfTableRowsState: getState(numberOfTableRowsStateScopeMap, scopeId),
    currentTableCellInEditModePositionState: getState(
      currentTableCellInEditModePositionStateScopeMap,
      scopeId,
    ),
    isTableCellInEditModeFamilyState: getFamilyState(
      isTableCellInEditModeFamilyStateScopeMap,
      scopeId,
    ),
    isSoftFocusActiveState: getState(isSoftFocusActiveStateScopeMap, scopeId),
    isSoftFocusOnTableCellFamilyState: getFamilyState(
      isSoftFocusOnTableCellFamilyStateScopeMap,
      scopeId,
    ),
    tableRowIdsState: getState(tableRowIdsStateScopeMap, scopeId),
    isRowSelectedFamilyState: getFamilyState(
      isRowSelectedFamilyStateScopeMap,
      scopeId,
    ),
    isRecordTableInitialLoadingState: getState(
      isRecordTableInitialLoadingStateScopeMap,
      scopeId,
    ),
    resizeFieldOffsetState: getState(resizeFieldOffsetStateScopeMap, scopeId),
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
