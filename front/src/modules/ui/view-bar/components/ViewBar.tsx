import type { Context, ReactNode } from 'react';

import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { TopBar } from '@/ui/top-bar/TopBar';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { FilterDropdownButton } from './FilterDropdownButton';
import { SortDropdownButton } from './SortDropdownButton';
import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import ViewBarDetails from './ViewBarDetails';
import { ViewsDropdownButton } from './ViewsDropdownButton';

export type ViewBarProps = {
  className?: string;
  optionsDropdownButton: ReactNode;
  optionsDropdownKey: string;
  scopeContext: Context<string | null>;
};

export const ViewBar = ({
  className,
  optionsDropdownButton,
  optionsDropdownKey,
  scopeContext,
}: ViewBarProps) => {
  const { openDropdownButton: openOptionsDropdownButton } = useDropdownButton({
    dropdownId: optionsDropdownKey,
  });

  return (
    <TopBar
      className={className}
      leftComponent={
        <ViewsDropdownButton
          onViewEditModeChange={openOptionsDropdownButton}
          hotkeyScope={ViewsHotkeyScope.ListDropdown}
          scopeContext={scopeContext}
        />
      }
      displayBottomBorder={false}
      rightComponent={
        <>
          <FilterDropdownButton
            hotkeyScope={{ scope: FiltersHotkeyScope.FilterDropdownButton }}
            context={scopeContext}
          />
          <SortDropdownButton
            context={scopeContext}
            hotkeyScope={{ scope: FiltersHotkeyScope.FilterDropdownButton }}
            isPrimaryButton
          />
          {optionsDropdownButton}
        </>
      }
      bottomComponent={
        <ViewBarDetails
          context={scopeContext}
          hasFilterButton
          rightComponent={
            <UpdateViewButtonGroup
              onViewEditModeChange={openOptionsDropdownButton}
              hotkeyScope={ViewsHotkeyScope.CreateDropdown}
              scopeContext={scopeContext}
            />
          }
        />
      }
    />
  );
};
