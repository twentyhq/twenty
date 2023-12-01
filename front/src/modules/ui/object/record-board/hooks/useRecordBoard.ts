import { useSetRecoilState } from 'recoil';

import { useBoardActionBarEntries } from '@/ui/object/record-board/hooks/internal/useBoardActionBarEntries';
import { useBoardCardFields } from '@/ui/object/record-board/hooks/internal/useBoardCardFields';
import { useBoardContextMenuEntries } from '@/ui/object/record-board/hooks/internal/useBoardContextMenuEntries';
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

  const { setActionBarEntries } = useBoardActionBarEntries();
  const { setContextMenuEntries } = useBoardContextMenuEntries();

  const { handleFieldVisibilityChange, handleFieldsReorder } =
    useBoardCardFields();

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
