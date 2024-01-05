import { useRecoilValue } from 'recoil';

import { useRecordTableScopedStates } from '@/object-record/record-table/hooks/internal/useRecordTableScopedStates';
import { getRecordTableScopeInjector } from '@/object-record/record-table/utils/getRecordTableScopeInjector';
import { ContextMenu } from '@/ui/navigation/context-menu/components/ContextMenu';

export const RecordTableContextMenu = ({
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

  return <ContextMenu selectedIds={selectedRowIds} />;
};
