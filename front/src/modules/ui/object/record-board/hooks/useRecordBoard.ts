import { useSetRecoilState } from 'recoil';

import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/useRecordBoardScopedStates';
import { RecordBoardScopeInternalContext } from '@/ui/object/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordBoardProps = {
  recordTableScopeId?: string;
};

export const useRecordBoard = (props?: useRecordBoardProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
    props?.recordTableScopeId,
  );

  const { isBoardLoadedState, boardColumnsState } = useRecordBoardScopedStates({
    recordBoardScopeId: scopeId,
  });
  const setIsBoardLoaded = useSetRecoilState(isBoardLoadedState);

  const setBoardColumns = useSetRecoilState(boardColumnsState);

  return {
    scopeId,
    setIsBoardLoaded,
    setBoardColumns,
  };
};
