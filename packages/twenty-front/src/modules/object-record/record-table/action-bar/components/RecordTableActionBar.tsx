import { useRecoilValue } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { ActionBar } from '@/ui/navigation/action-bar/components/ActionBar';

export const RecordTableActionBar = ({
  recordTableId,
}: {
  recordTableId: string;
}) => {
  const { selectedRowIdsScopeInjector } = getRecordTableScopeInjector();

  const { injectSelectorWithRecordTableScopeId } =
    useRecordTableScopedStates(recordTableId);

  const selectedRowIdsSelector = injectSelectorWithRecordTableScopeId(
    selectedRowIdsScopeInjector,
  );

  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  return <ActionBar selectedIds={selectedRowIds} />;
};
