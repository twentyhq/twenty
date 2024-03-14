import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { availableTableColumnsComponentState } from '@/object-record/record-table/states/availableTableColumnsComponentState';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { isSoftFocusActiveComponentState } from '@/object-record/record-table/states/isSoftFocusActiveComponentState';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { numberOfTableRowsComponentState } from '@/object-record/record-table/states/numberOfTableRowsComponentState';
import { onColumnsChangeComponentState } from '@/object-record/record-table/states/onColumnsChangeComponentState';
import { onEntityCountChangeComponentState } from '@/object-record/record-table/states/onEntityCountChangeComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { allRowsSelectedStatusComponentSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusComponentSelector';
import { hiddenTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/hiddenTableColumnsComponentSelector';
import { numberOfTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/numberOfTableColumnsComponentSelector';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { softFocusPositionComponentState } from '@/object-record/record-table/states/softFocusPositionComponentState';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { tableFiltersComponentState } from '@/object-record/record-table/states/tableFiltersComponentState';
import { tableLastRowVisibleComponentState } from '@/object-record/record-table/states/tableLastRowVisibleComponentState';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { tableSortsComponentState } from '@/object-record/record-table/states/tableSortsComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentReadOnlySelector } from '@/ui/utilities/state/component-state/utils/extractComponentReadOnlySelector';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useRecordTableStates = (recordTableId?: string) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(recordTableId),
  );

  return {
    scopeId,
    getAvailableTableColumnsState: extractComponentState(
      availableTableColumnsComponentState,
      scopeId,
    ),
    getTableFiltersState: extractComponentState(
      tableFiltersComponentState,
      scopeId,
    ),
    getTableSortsState: extractComponentState(
      tableSortsComponentState,
      scopeId,
    ),
    getTableColumnsState: extractComponentState(
      tableColumnsComponentState,
      scopeId,
    ),

    getOnColumnsChangeState: extractComponentState(
      onColumnsChangeComponentState,
      scopeId,
    ),
    getOnEntityCountChangeState: extractComponentState(
      onEntityCountChangeComponentState,
      scopeId,
    ),
    getTableLastRowVisibleState: extractComponentState(
      tableLastRowVisibleComponentState,
      scopeId,
    ),
    getSoftFocusPositionState: extractComponentState(
      softFocusPositionComponentState,
      scopeId,
    ),
    getNumberOfTableRowsState: extractComponentState(
      numberOfTableRowsComponentState,
      scopeId,
    ),
    getCurrentTableCellInEditModePositionState: extractComponentState(
      currentTableCellInEditModePositionComponentState,
      scopeId,
    ),
    isTableCellInEditModeFamilyState: extractComponentFamilyState(
      isTableCellInEditModeComponentFamilyState,
      scopeId,
    ),
    getIsSoftFocusActiveState: extractComponentState(
      isSoftFocusActiveComponentState,
      scopeId,
    ),
    getTableRowIdsState: extractComponentState(
      tableRowIdsComponentState,
      scopeId,
    ),
    getIsRecordTableInitialLoadingState: extractComponentState(
      isRecordTableInitialLoadingComponentState,
      scopeId,
    ),
    getResizeFieldOffsetState: extractComponentState(
      resizeFieldOffsetComponentState,
      scopeId,
    ),
    isSoftFocusOnTableCellFamilyState: extractComponentFamilyState(
      isSoftFocusOnTableCellComponentFamilyState,
      scopeId,
    ),
    isRowSelectedFamilyState: extractComponentFamilyState(
      isRowSelectedComponentFamilyState,
      scopeId,
    ),
    getAllRowsSelectedStatusSelector: extractComponentReadOnlySelector(
      allRowsSelectedStatusComponentSelector,
      scopeId,
    ),
    getHiddenTableColumnsSelector: extractComponentReadOnlySelector(
      hiddenTableColumnsComponentSelector,
      scopeId,
    ),
    getNumberOfTableColumnsSelector: extractComponentReadOnlySelector(
      numberOfTableColumnsComponentSelector,
      scopeId,
    ),
    getSelectedRowIdsSelector: extractComponentReadOnlySelector(
      selectedRowIdsComponentSelector,
      scopeId,
    ),
    getVisibleTableColumnsSelector: extractComponentReadOnlySelector(
      visibleTableColumnsComponentSelector,
      scopeId,
    ),
  };
};
