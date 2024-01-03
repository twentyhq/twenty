import { useRecoilValue } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';

import { useCurrentTableCellPosition } from './useCurrentCellPosition';

export const useIsSoftFocusOnCurrentTableCell = () => {
  const currentTableCellPosition = useCurrentTableCellPosition();

  const { isSoftFocusOnTableCellScopeInjector } = getRecordTableScopeInjector();

  const { injectFamilyStateWithRecordTableScopeId } =
    useRecordTableScopedStates();

  const isSoftFocusActiveFamilyState = injectFamilyStateWithRecordTableScopeId(
    isSoftFocusOnTableCellScopeInjector,
  );

  const isSoftFocusOnTableCell = useRecoilValue(
    isSoftFocusActiveFamilyState(currentTableCellPosition),
  );

  return isSoftFocusOnTableCell;
};
