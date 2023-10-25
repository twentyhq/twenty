import { ReactNode } from 'react';

import { FilterDropdownButton } from '@/ui/data/filter/components/FilterDropdownButton';
import { SortDropdownButton } from '@/ui/data/sort/components/SortDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TopBar } from '@/ui/layout/top-bar/TopBar';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';
import { ViewsDropdownButton } from './ViewsDropdownButton';

export type ViewBarProps = {
  className?: string;
  optionsDropdownButton: ReactNode;
  optionsDropdownScopeId: string;
};

export const ViewBar = ({
  className,
  optionsDropdownButton,
  optionsDropdownScopeId,
}: ViewBarProps) => {
  const { openDropdown: openOptionsDropdownButton } = useDropdown({
    dropdownScopeId: optionsDropdownScopeId,
  });

  return (
    <TopBar
      className={className}
      leftComponent={
        <ViewsDropdownButton
          onViewEditModeChange={openOptionsDropdownButton}
          hotkeyScope={{ scope: ViewsHotkeyScope.ListDropdown }}
        />
      }
      displayBottomBorder={false}
      rightComponent={
        <>
          <FilterDropdownButton
            hotkeyScope={{ scope: FiltersHotkeyScope.FilterDropdownButton }}
          />
          <SortDropdownButton
            hotkeyScope={{ scope: FiltersHotkeyScope.SortDropdownButton }}
            isPrimaryButton
          />
          {optionsDropdownButton}
        </>
      }
      bottomComponent={
        <ViewBarDetails
          hasFilterButton
          rightComponent={
            <UpdateViewButtonGroup
              onViewEditModeChange={openOptionsDropdownButton}
              hotkeyScope={ViewsHotkeyScope.CreateDropdown}
            />
          }
        />
      }
    />
  );
};
