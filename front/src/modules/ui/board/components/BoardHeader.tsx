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
    'availableSorts' | 'defaultViewName' | 'onViewSubmit' | 'scopeContext'
  >;

export function BoardHeader<SortField>({
  onStageAdd,
  ...props
}: BoardHeaderProps<SortField>) {
  const OptionsDropdownButton = useCallback(
    () => (
      <BoardOptionsDropdown
        customHotkeyScope={{ scope: BoardOptionsHotkeyScope.Dropdown }}
        onStageAdd={onStageAdd}
      />
    ),
    [onStageAdd],
  );

  return (
    <RecoilScope SpecificContext={DropdownRecoilScopeContext}>
      <ViewBar
        {...props}
        optionsDropdownKey={BoardOptionsDropdownKey}
        OptionsDropdownButton={OptionsDropdownButton}
      />
    </RecoilScope>
  );
}
