import { type ComponentProps, useCallback } from 'react';

import { DropdownRecoilScopeContext } from '@/ui/dropdown/states/recoil-scope-contexts/DropdownRecoilScopeContext';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { ViewBar, type ViewBarProps } from '@/ui/view-bar/components/ViewBar';

import type { BoardColumnDefinition } from '../types/BoardColumnDefinition';
import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';
import { BoardOptionsHotkeyScope } from '../types/BoardOptionsHotkeyScope';

import { BoardOptionsDropdown } from './BoardOptionsDropdown';

export type BoardHeaderProps<SortField> = ComponentProps<'div'> & {
  onStageAdd?: (boardColumn: BoardColumnDefinition) => void;
} & Pick<
    ViewBarProps<SortField>,
    | 'availableSorts'
    | 'defaultViewName'
    | 'onViewsChange'
    | 'onViewSubmit'
    | 'scopeContext'
  >;

export function BoardHeader<SortField>({
  onStageAdd,
  onViewsChange,
  scopeContext,
  ...props
}: BoardHeaderProps<SortField>) {
  const OptionsDropdownButton = useCallback(
    () => (
      <BoardOptionsDropdown
        customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
        onStageAdd={onStageAdd}
        onViewsChange={onViewsChange}
        scopeContext={scopeContext}
      />
    ),
    [onStageAdd, onViewsChange, scopeContext],
  );

  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <ViewBar
        {...props}
        onViewsChange={onViewsChange}
        optionsDropdownKey={BoardOptionsDropdownKey}
        OptionsDropdownButton={OptionsDropdownButton}
        scopeContext={scopeContext}
        displayBottomBorder={false}
        leftComponent={
          <>
            <StyledIcon>{viewIcon}</StyledIcon>
            {viewName}
          </>
        }
        rightComponent={
          <>
            <FilterDropdownButton
              context={context}
              hotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            />
            <SortDropdownButton<SortField>
              context={context}
              availableSorts={availableSorts || []}
              hotkeyScope={FiltersHotkeyScope.FilterDropdownButton}
            />
            <BoardOptionsDropdown
              customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
              onStageAdd={onStageAdd}
            />
          </>
        }
        bottomComponent={<ViewBarDetails context={context} />}
      />
    </RecoilScope>
  );
}
