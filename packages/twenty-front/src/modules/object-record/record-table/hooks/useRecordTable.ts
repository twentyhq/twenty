import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { useGetIsSomeCellInEditMode } from '@/object-record/record-table/hooks/internal/useGetIsSomeCellInEditMode';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useSetHotkeyScope } from '@/ui/utilities/hotkey/hooks/useSetHotkeyScope';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopedStateDeprecated } from '@/ui/utilities/recoil-scope/utils/getScopedStateDeprecated';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { onEntityCountChangeScopedState } from '../states/onEntityCountChangeScopedState';
import { ColumnDefinition } from '../types/ColumnDefinition';
import { TableHotkeyScope } from '../types/TableHotkeyScope';

import { useDisableSoftFocus } from './internal/useDisableSoftFocus';
import { useLeaveTableFocus } from './internal/useLeaveTableFocus';
import { useRecordTableScopedStates } from './internal/useRecordTableScopedStates';
import { useResetTableRowSelection } from './internal/useResetTableRowSelection';
import { useSelectAllRows } from './internal/useSelectAllRows';
import { useSetRecordTableData } from './internal/useSetRecordTableData';
import { useSetRowSelectedState } from './internal/useSetRowSelectedState';
import { useSetSoftFocusPosition } from './internal/useSetSoftFocusPosition';
import { useUpsertRecordTableItem } from './internal/useUpsertRecordTableItem';

type useRecordTableProps = {
  recordTableScopeId?: string;
};

export const useRecordTable = (props?: useRecordTableProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    props?.recordTableScopeId,
  );

  const {
    injectStateWithRecordTableScopeId,
    injectSnapshotValueWithRecordTableScopeId,
    injectSelectorSnapshotValueWithRecordTableScopeId,
  } = useRecordTableScopedStates(scopeId);

  const {
    availableTableColumnsScopeInjector,
    tableFiltersScopeInjector,
    tableSortsScopeInjector,
    tableColumnsScopeInjector,
    objectMetadataConfigScopeInjector,
    onEntityCountScopeInjector,
    softFocusPositionScopeInjector,
    numberOfTableRowsScopeInjector,
    numberOfTableColumnsScopeInjector,
    onColumnsChangeScopeInjector,
    isRecordTableInitialLoadingScopeInjector,
    tableLastRowVisibleScopeInjector,
  } = getRecordTableScopeInjector();

  const setAvailableTableColumns = useSetRecoilState(
    injectStateWithRecordTableScopeId(availableTableColumnsScopeInjector),
  );

  const setOnEntityCountChange = useSetRecoilState(
    injectStateWithRecordTableScopeId(onEntityCountScopeInjector),
  );
  const setTableFilters = useSetRecoilState(
    injectStateWithRecordTableScopeId(tableFiltersScopeInjector),
  );
  const setObjectMetadataConfig = useSetRecoilState(
    injectStateWithRecordTableScopeId(objectMetadataConfigScopeInjector),
  );

  const setTableSorts = useSetRecoilState(
    injectStateWithRecordTableScopeId(tableSortsScopeInjector),
  );

  const setTableColumns = useSetRecoilState(
    injectStateWithRecordTableScopeId(tableColumnsScopeInjector),
  );

  const setOnColumnsChange = useSetRecoilState(
    injectStateWithRecordTableScopeId(onColumnsChangeScopeInjector),
  );

  const setIsRecordTableInitialLoading = useSetRecoilState(
    injectStateWithRecordTableScopeId(isRecordTableInitialLoadingScopeInjector),
  );

  const setRecordTableLastRowVisible = useSetRecoilState(
    injectStateWithRecordTableScopeId(tableLastRowVisibleScopeInjector),
  );

  const onColumnsChange = useRecoilCallback(
    ({ snapshot }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const onColumnsChange = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          onColumnsChangeScopeInjector,
        );

        onColumnsChange?.(columns);
      },
    [injectSnapshotValueWithRecordTableScopeId, onColumnsChangeScopeInjector],
  );

  const onEntityCountChange = useRecoilCallback(
    ({ snapshot }) =>
      (count: number) => {
        const onEntityCountChangeState = getScopedStateDeprecated(
          onEntityCountChangeScopedState,
          scopeId,
        );
        const onEntityCountChange = getSnapshotValue(
          snapshot,
          onEntityCountChangeState,
        );

        onEntityCountChange?.(count);
      },
    [scopeId],
  );

  const setRecordTableData = useSetRecordTableData({
    recordTableScopeId: scopeId,
    onEntityCountChange,
  });

  const leaveTableFocus = useLeaveTableFocus(scopeId);

  const setRowSelectedState = useSetRowSelectedState(scopeId);

  const resetTableRowSelection = useResetTableRowSelection(scopeId);

  const upsertRecordTableItem = useUpsertRecordTableItem();

  const setSoftFocusPosition = useSetSoftFocusPosition(scopeId);

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          softFocusPositionScopeInjector,
        );

        let newRowNumber = softFocusPosition.row - 1;

        if (newRowNumber < 0) {
          newRowNumber = 0;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [
      injectSnapshotValueWithRecordTableScopeId,
      setSoftFocusPosition,
      softFocusPositionScopeInjector,
    ],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          softFocusPositionScopeInjector,
        );

        const numberOfTableRows = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          numberOfTableRowsScopeInjector,
        );

        let newRowNumber = softFocusPosition.row + 1;

        if (newRowNumber >= numberOfTableRows) {
          newRowNumber = numberOfTableRows - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [
      injectSnapshotValueWithRecordTableScopeId,
      numberOfTableRowsScopeInjector,
      setSoftFocusPosition,
      softFocusPositionScopeInjector,
    ],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          softFocusPositionScopeInjector,
        );

        const numberOfTableColumns =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            numberOfTableColumnsScopeInjector,
          );

        const numberOfTableRows = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          numberOfTableRowsScopeInjector,
        );
        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isLastRowAndLastColumn =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber === numberOfTableRows - 1;

        const isLastColumnButNotLastRow =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber !== numberOfTableRows - 1;

        const isNotLastColumn =
          currentColumnNumber !== numberOfTableColumns - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setSoftFocusPosition({
            row: currentRowNumber + 1,
            column: 0,
          });
        }
      },
    [
      injectSelectorSnapshotValueWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      numberOfTableColumnsScopeInjector,
      numberOfTableRowsScopeInjector,
      setSoftFocusPosition,
      softFocusPositionScopeInjector,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = injectSnapshotValueWithRecordTableScopeId(
          snapshot,
          softFocusPositionScopeInjector,
        );

        const numberOfTableColumns =
          injectSelectorSnapshotValueWithRecordTableScopeId(
            snapshot,
            numberOfTableColumnsScopeInjector,
          );

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isFirstRowAndFirstColumn =
          currentColumnNumber === 0 && currentRowNumber === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnNumber === 0 && currentRowNumber > 0;

        const isNotFirstColumn = currentColumnNumber > 0;

        if (isFirstRowAndFirstColumn) {
          return;
        }

        if (isNotFirstColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setSoftFocusPosition({
            row: currentRowNumber - 1,
            column: numberOfTableColumns - 1,
          });
        }
      },
    [
      injectSelectorSnapshotValueWithRecordTableScopeId,
      injectSnapshotValueWithRecordTableScopeId,
      numberOfTableColumnsScopeInjector,
      setSoftFocusPosition,
      softFocusPositionScopeInjector,
    ],
  );

  const useMapKeyboardToSoftFocus = () => {
    const disableSoftFocus = useDisableSoftFocus(scopeId);
    const setHotkeyScope = useSetHotkeyScope();

    useScopedHotkeys(
      [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`],
      () => {
        moveUp();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveUp],
    );

    useScopedHotkeys(
      Key.ArrowDown,
      () => {
        moveDown();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveDown],
    );

    useScopedHotkeys(
      [Key.ArrowLeft, `${Key.Shift}+${Key.Tab}`],
      () => {
        moveLeft();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveLeft],
    );

    useScopedHotkeys(
      [Key.ArrowRight, Key.Tab],
      () => {
        moveRight();
      },
      TableHotkeyScope.TableSoftFocus,
      [moveRight],
    );

    useScopedHotkeys(
      [Key.Escape],
      () => {
        setHotkeyScope(TableHotkeyScope.Table, {
          goto: true,
          keyboardShortcutMenu: true,
        });
        disableSoftFocus();
      },
      TableHotkeyScope.TableSoftFocus,
      [disableSoftFocus],
    );
  };

  const { selectAllRows } = useSelectAllRows(scopeId);

  const getIsSomeCellInEditMode = useGetIsSomeCellInEditMode(scopeId);

  return {
    scopeId,
    onColumnsChange,
    setAvailableTableColumns,
    setTableFilters,
    setTableSorts,
    setObjectMetadataConfig,
    setOnEntityCountChange,
    setRecordTableData,
    setTableColumns,
    leaveTableFocus,
    setRowSelectedState,
    resetTableRowSelection,
    upsertRecordTableItem,
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    useMapKeyboardToSoftFocus,
    selectAllRows,
    setOnColumnsChange,
    setIsRecordTableInitialLoading,
    setRecordTableLastRowVisible,
    setSoftFocusPosition,
    getIsSomeCellInEditMode,
  };
};
