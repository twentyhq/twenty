import { useContext } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useContextScopeId } from '@/ui/utilities/recoil-scope/hooks/useContextScopeId';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { ViewBar, type ViewBarProps } from '@/ui/view-bar/components/ViewBar';
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
} & Pick<ViewBarProps, 'scopeContext'>;

export function BoardHeader({
  className,
  onStageAdd,
  scopeContext,
}: BoardHeaderProps) {
  const { onCurrentViewSubmit, ...viewBarContextProps } =
    useContext(ViewBarContext);
  const tableScopeId = useContextScopeId(scopeContext);

  const currentViewId = useRecoilScopedValue(
    currentViewIdScopedState,
    scopeContext,
  );
  const canPersistBoardCardFields = useRecoilValue(
    canPersistBoardCardFieldsScopedFamilySelector([
      tableScopeId,
      currentViewId,
    ]),
  );
  const [boardCardFields, setBoardCardFields] = useRecoilScopedState(
    boardCardFieldsScopedState,
    scopeContext,
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
        set(boardCardFieldsScopedState(tableScopeId), savedBoardCardFields);
      },
    [tableScopeId],
  );

  const handleCurrentViewSubmit = async () => {
    if (canPersistBoardCardFields) {
      setSavedBoardCardFields(boardCardFields);
    }

    await onCurrentViewSubmit?.();
  };

  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
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
              scopeContext={scopeContext}
            />
          }
          optionsDropdownKey={BoardOptionsDropdownKey}
          scopeContext={scopeContext}
        />
      </ViewBarContext.Provider>
    </RecoilScope>
  );
}
