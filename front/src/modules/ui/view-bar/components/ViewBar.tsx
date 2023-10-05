import { ReactNode } from 'react';

import { TopBar } from '@/ui/top-bar/TopBar';
import { useViewBarDropdownButton } from '@/ui/view-bar/hooks/useViewBarDropdownButton';

import { FiltersHotkeyScope } from '../types/FiltersHotkeyScope';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { FilterDropdownButton } from './FilterDropdownButton';
import { SortDropdownButton } from './SortDropdownButton';
import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';
import { ViewsDropdownButton } from './ViewsDropdownButton';

export type ViewBarProps = {
  className?: string;
  optionsDropdownButton: ReactNode;
  optionsDropdownKey: string;
};

export const ViewBar = ({
  className,
  optionsDropdownButton,
  optionsDropdownKey,
}: ViewBarProps) => {
  const { openDropdown: openOptionsDropdownButton } = useViewBarDropdownButton({
    dropdownId: optionsDropdownKey,
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
