import { useContext, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { isSoftFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isSoftFocusOnTableCellComponentFamilyState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopeIdOrUndefinedFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdOrUndefinedFromComponentId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';

export const RecordTableCellWrapper = ({
  children,
  column,
  columnIndex,
}: {
  column: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
  children: React.ReactNode;
}) => {
  const tableScopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    getScopeIdOrUndefinedFromComponentId(),
  );

  const { rowIndex } = useContext(RecordTableRowContext);

  const currentTableCellPosition: TableCellPosition = useMemo(
    () => ({
      column: columnIndex,
      row: rowIndex,
    }),
    [columnIndex, rowIndex],
  );

  const isTableCellInEditModeFamilyState = extractComponentFamilyState(
    isTableCellInEditModeComponentFamilyState,
    tableScopeId,
  );

  const isSoftFocusOnTableCellFamilyState = extractComponentFamilyState(
    isSoftFocusOnTableCellComponentFamilyState,
    tableScopeId,
  );

  const isInEditMode = useRecoilValue(
    isTableCellInEditModeFamilyState(currentTableCellPosition),
  );

  const hasSoftFocus = useRecoilValue(
    isSoftFocusOnTableCellFamilyState(currentTableCellPosition),
  );

  return (
    <RecordTableCellContext.Provider
      value={{
        columnDefinition: column,
        columnIndex,
        isInEditMode,
        hasSoftFocus,
        cellPosition: currentTableCellPosition,
      }}
      key={column.fieldMetadataId}
    >
      <RecordTableCellFieldContextWrapper>
        {children}
      </RecordTableCellFieldContextWrapper>
    </RecordTableCellContext.Provider>
  );
};
