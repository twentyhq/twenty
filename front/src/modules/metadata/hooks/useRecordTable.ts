import { RecordTableScopeInternalContext } from '@/ui/object/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

import { useRecordTableScopedStates } from './internal/useRecordTableScopedStates';

type useRecordTableProps = {
  recordTableScopeId?: string;
};

export const useRecordTable = (props?: useRecordTableProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    props?.recordTableScopeId,
  );

  const { onColumnsChangeState } = useRecordTableScopedStates({
    customRecordTableScopeId: scopeId,
  });

  return {
    scopeId,
    onColumnsChangeState,
  };
};
