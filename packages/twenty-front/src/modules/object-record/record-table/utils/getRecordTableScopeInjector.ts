import { isRowSelectedScopedFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedScopedFamilyState';
import { currentTableCellInEditModePositionScopedState } from '@/object-record/record-table/states/currentTableCellInEditModePositionScopedState';
import { isRecordTableInitialLoadingScopedState } from '@/object-record/record-table/states/isRecordTableInitialLoadingScopedState';
import { isSoftFocusActiveScopedState } from '@/object-record/record-table/states/isSoftFocusActiveScopedState';
import { isSoftFocusOnTableCellScopedFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellScopedFamilyState';
import { isTableCellInEditModeScopedFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeScopedFamilyState';
import { numberOfTableRowsScopedState } from '@/object-record/record-table/states/numberOfTableRowsScopedState';
import { objectMetadataConfigScopedState } from '@/object-record/record-table/states/objectMetadataConfigScopedState';
import { resizeFieldOffsetScopedState } from '@/object-record/record-table/states/resizeFieldOffsetScopedState';
import { allRowsSelectedStatusScopedSelector } from '@/object-record/record-table/states/selectors/allRowsSelectedStatusScopedSelector';
import { numberOfTableColumnsScopedSelector } from '@/object-record/record-table/states/selectors/numberOfTableColumnsScopedSelector';
import { selectedRowIdsScopedSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsScopedSelector';
import { softFocusPositionScopedState } from '@/object-record/record-table/states/softFocusPositionScopedState';
import { tableLastRowVisibleScopedState } from '@/object-record/record-table/states/tableLastRowVisibleScopedState';
import { tableRowIdsScopedState } from '@/object-record/record-table/states/tableRowIdsScopedState';
import { getFamilyScopeInjector } from '@/ui/utilities/recoil-scope/utils/getFamilyScopeInjector';
import { getScopeInjector } from '@/ui/utilities/recoil-scope/utils/getScopeInjector';
import { getSelectorScopeInjector } from '@/ui/utilities/recoil-scope/utils/getSelectorScopeInjector';

import { availableTableColumnsScopedState } from '../states/availableTableColumnsScopedState';
import { onColumnsChangeScopedState } from '../states/onColumnsChangeScopedState';
import { onEntityCountChangeScopedState } from '../states/onEntityCountChangeScopedState';
import { hiddenTableColumnsScopedSelector } from '../states/selectors/hiddenTableColumnsScopedSelector';
import { tableColumnsByKeyScopedSelector } from '../states/selectors/tableColumnsByKeyScopedSelector';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';
import { tableColumnsScopedState } from '../states/tableColumnsScopedState';
import { tableFiltersScopedState } from '../states/tableFiltersScopedState';
import { tableSortsScopedState } from '../states/tableSortsScopedState';

export const getRecordTableScopeInjector = () => {
  const availableTableColumnsScopeInjector = getScopeInjector(
    availableTableColumnsScopedState,
  );

  const tableFiltersScopeInjector = getScopeInjector(tableFiltersScopedState);

  const tableSortsScopeInjector = getScopeInjector(tableSortsScopedState);

  const tableColumnsScopeInjector = getScopeInjector(tableColumnsScopedState);

  const objectMetadataConfigScopeInjector = getScopeInjector(
    objectMetadataConfigScopedState,
  );

  const tableColumnsByKeyScopeInjector = getSelectorScopeInjector(
    tableColumnsByKeyScopedSelector,
  );

  const hiddenTableColumnsScopeInjector = getSelectorScopeInjector(
    hiddenTableColumnsScopedSelector,
  );

  const visibleTableColumnsScopeInjector = getSelectorScopeInjector(
    visibleTableColumnsScopedSelector,
  );

  const onColumnsChangeScopeInjector = getScopeInjector(
    onColumnsChangeScopedState,
  );

  const onEntityCountScopeInjector = getScopeInjector(
    onEntityCountChangeScopedState,
  );

  const tableLastRowVisibleScopeInjector = getScopeInjector(
    tableLastRowVisibleScopedState,
  );

  const softFocusPositionScopeInjector = getScopeInjector(
    softFocusPositionScopedState,
  );

  const numberOfTableRowsScopeInjector = getScopeInjector(
    numberOfTableRowsScopedState,
  );

  const numberOfTableColumnsScopeInjector = getSelectorScopeInjector(
    numberOfTableColumnsScopedSelector,
  );

  const currentTableCellInEditModePositionScopeInjector = getScopeInjector(
    currentTableCellInEditModePositionScopedState,
  );

  const isTableCellInEditModeScopeInjector = getFamilyScopeInjector(
    isTableCellInEditModeScopedFamilyState,
  );

  const isSoftFocusActiveScopeInjector = getScopeInjector(
    isSoftFocusActiveScopedState,
  );

  const isSoftFocusOnTableCellScopeInjector = getFamilyScopeInjector(
    isSoftFocusOnTableCellScopedFamilyState,
  );

  const tableRowIdsScopeInjector = getScopeInjector(tableRowIdsScopedState);

  const isRowSelectedScopeInjector = getFamilyScopeInjector(
    isRowSelectedScopedFamilyState,
  );

  const allRowsSelectedStatusScopeInjector = getSelectorScopeInjector(
    allRowsSelectedStatusScopedSelector,
  );

  const selectedRowIdsScopeInjector = getSelectorScopeInjector(
    selectedRowIdsScopedSelector,
  );

  const isRecordTableInitialLoadingScopeInjector = getScopeInjector(
    isRecordTableInitialLoadingScopedState,
  );

  const resizeFieldOffsetScopeInjector = getScopeInjector(
    resizeFieldOffsetScopedState,
  );

  return {
    availableTableColumnsScopeInjector,
    tableFiltersScopeInjector,
    tableSortsScopeInjector,
    tableColumnsScopeInjector,
    objectMetadataConfigScopeInjector,
    tableColumnsByKeyScopeInjector,
    hiddenTableColumnsScopeInjector,
    visibleTableColumnsScopeInjector,
    onColumnsChangeScopeInjector,
    onEntityCountScopeInjector,
    tableLastRowVisibleScopeInjector,
    softFocusPositionScopeInjector,
    numberOfTableRowsScopeInjector,
    numberOfTableColumnsScopeInjector,
    currentTableCellInEditModePositionScopeInjector,
    isTableCellInEditModeScopeInjector,
    isSoftFocusActiveScopeInjector,
    isSoftFocusOnTableCellScopeInjector,
    tableRowIdsScopeInjector,
    isRowSelectedScopeInjector,
    allRowsSelectedStatusScopeInjector,
    selectedRowIdsScopeInjector,
    isRecordTableInitialLoadingScopeInjector,
    resizeFieldOffsetScopeInjector,
  };
};
