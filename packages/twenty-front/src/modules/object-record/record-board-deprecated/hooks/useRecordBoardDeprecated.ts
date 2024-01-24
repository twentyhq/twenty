import { useSetRecoilState } from 'recoil';

import { useCreateOpportunity } from '@/object-record/record-board-deprecated/hooks/internal/useCreateOpportunity';
import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { RecordBoardDeprecatedScopeInternalContext } from '@/object-record/record-board-deprecated/scopes/scope-internal-context/RecordBoardDeprecatedScopeInternalContext';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type useRecordBoardDeprecatedProps = {
  recordBoardScopeId?: string;
};

export const useRecordBoardDeprecated = (
  props?: useRecordBoardDeprecatedProps,
) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordBoardDeprecatedScopeInternalContext,
    props?.recordBoardScopeId,
  );

  const { isBoardLoadedState, boardColumnsState, onFieldsChangeState } =
    useRecordBoardDeprecatedScopedStates({
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
