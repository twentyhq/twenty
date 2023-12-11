import { useSetRecoilState } from 'recoil';

import { useCreateOpportunity } from '@/object-record/record-board/hooks/internal/useCreateOpportunity';
import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordBoardProps = {
  recordBoardScopeId?: string;
};

export const useRecordBoard = (props?: useRecordBoardProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    props?.recordBoardScopeId,
  );

  const { isBoardLoadedState, boardColumnsState, onFieldsChangeState } =
    useRecordBoardScopedStates({
      recordBoardScopeId: scopeId,
    });
  const setIsBoardLoaded = useSetRecoilState(isBoardLoadedState);

  const setBoardColumns = useSetRecoilState(boardColumnsState);

  const createOpportunity = useCreateOpportunity();

  const setOnFieldsChange = useSetRecoilState(onFieldsChangeState);

  return {
    scopeId,
    setIsBoardLoaded,
    setBoardColumns,
    createOpportunity,
    setOnFieldsChange,
  };
};
