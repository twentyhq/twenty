import type { ComponentProps } from 'react';

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
  onViewSubmit,
  scopeContext,
  availableSorts,
  defaultViewName,
}: BoardHeaderProps<SortField>) {
  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <ViewBar
        availableSorts={availableSorts}
        defaultViewName={defaultViewName}
        onViewsChange={onViewsChange}
        onViewSubmit={onViewSubmit}
        optionsDropdownButton={
          <BoardOptionsDropdown
            customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
            onStageAdd={onStageAdd}
            onViewsChange={onViewsChange}
            scopeContext={scopeContext}
          />
        }
        optionsDropdownKey={BoardOptionsDropdownKey}
        scopeContext={scopeContext}
      />
    </RecoilScope>
  );
}
