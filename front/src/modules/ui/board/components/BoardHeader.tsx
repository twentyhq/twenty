import { useContext } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { BoardContext } from '@/companies/states/contexts/BoardContext';
import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { ViewBar } from '@/ui/view-bar/components/ViewBar';
import { ViewBarContext } from '@/ui/view-bar/contexts/ViewBarContext';
import { currentViewIdScopedState } from '@/ui/view-bar/states/currentViewIdScopedState';

import { boardCardFieldsScopedState } from '../states/boardCardFieldsScopedState';
import { savedBoardCardFieldsFamilyState } from '../states/savedBoardCardFieldsFamilyState';
import { canPersistBoardCardFieldsScopedFamilySelector } from '../states/selectors/canPersistBoardCardFieldsScopedFamilySelector';
import type { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';
import { BoardOptionsHotkeyScope } from '../types/BoardOptionsHotkeyScope';

import { BoardOptionsDropdown } from './BoardOptionsDropdown';

export type BoardHeaderProps = {
  className?: string;
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
};

export const BoardHeader = ({ className, onStageAdd }: BoardHeaderProps) => {
  const { onCurrentViewSubmit, ...viewBarContextProps } =
    useContext(ViewBarContext);

  const BoardRecoilScopeContext =
    useContext(BoardContext).BoardRecoilScopeContext;

  const ViewBarRecoilScopeContext =
    useContext(ViewBarContext).ViewBarRecoilScopeContext;

  const boardRecoilScopeId = useRecoilScopeId(BoardRecoilScopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    ViewBarRecoilScopeContext,
  );
  const canPersistBoardCardFields = useRecoilValue(
    canPersistBoardCardFieldsScopedFamilySelector({
      recoilScopeId: boardRecoilScopeId,
      viewId: currentViewId,
    }),
  );
  const [boardCardFields, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    BoardRecoilScopeContext,
  );
  const [savedBoardCardFields, setSavedBoardCardFields] = useRecoilState(
    savedBoardCardFieldsFamilyState(currentViewId),
  );

  const handleViewBarReset = () => setBoardCardFields(savedBoardCardFields);

  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const savedBoardCardFields = await snapshot.getPromise(
          savedBoardCardFieldsFamilyState(viewId),
        );
        set(
          boardCardFieldsScopedState(boardRecoilScopeId),
          savedBoardCardFields,
        );
      },
    [boardRecoilScopeId],
  );

  const handleCurrentViewSubmit = async () => {
    if (canPersistBoardCardFields) {
      setSavedBoardCardFields(boardCardFields);
    }

    await onCurrentViewSubmit?.();
  };

  return (
    <RecoilScope CustomRecoilScopeContext={DropdownRecoilScopeContext}>
      <ViewBarContext.Provider
        value={{
          ...viewBarContextProps,
          canPersistViewFields: canPersistBoardCardFields,
          onCurrentViewSubmit: handleCurrentViewSubmit,
          onViewBarReset: handleViewBarReset,
          onViewSelect: handleViewSelect,
        }}
      >
        <ViewBar
          className={className}
          optionsDropdownButton={
            <BoardOptionsDropdown
              customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
              onStageAdd={onStageAdd}
            />
          }
          optionsDropdownKey={BoardOptionsDropdownKey}
        />
      </ViewBarContext.Provider>
    </RecoilScope>
  );
};
