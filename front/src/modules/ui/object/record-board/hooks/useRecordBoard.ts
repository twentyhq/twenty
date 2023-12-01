import { useSetRecoilState } from 'recoil';

import { useBoardActionBarEntriesInternal } from '@/ui/object/record-board/hooks/internal/useBoardActionBarEntriesInternal';
import { useBoardCardFieldsInternal } from '@/ui/object/record-board/hooks/internal/useBoardCardFieldsInternal';
import { useBoardContextMenuEntriesInternal } from '@/ui/object/record-board/hooks/internal/useBoardContextMenuEntriesInternal';
import { useCreateOpportunity } from '@/ui/object/record-board/hooks/internal/useCreateOpportunity';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';
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

  const createOpportunity = useCreateOpportunity();

  const { setActionBarEntries } = useBoardActionBarEntriesInternal();
  const { setContextMenuEntries } = useBoardContextMenuEntriesInternal();

  const { handleFieldVisibilityChange, handleFieldsReorder } =
    useBoardCardFieldsInternal();

  return {
    scopeId,
    setIsBoardLoaded,
    setBoardColumns,
    createOpportunity,
    setActionBarEntries,
    setContextMenuEntries,
    handleFieldVisibilityChange,
    handleFieldsReorder,
  };
};
