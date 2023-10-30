import { ReactNode } from 'react';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { FilterDropdownButton } from '@/ui/object/filter/components/FilterDropdownButton';
import { FilterScope } from '@/ui/object/filter/scopes/FilterScope';
import { FiltersHotkeyScope } from '@/ui/object/filter/types/FiltersHotkeyScope';
import { SortDropdownButton } from '@/ui/object/sort/components/SortDropdownButton';
import { SortScope } from '@/ui/object/sort/scopes/SortScope';

import { useView } from '../hooks/useView';
import { useViewGetStates } from '../hooks/useViewGetStates';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';
import { ViewBarEffect } from './ViewBarEffect';
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
  const { upsertViewSort, upsertViewFilter } = useView();
  const { availableFilterDefinitions, availableSortDefinitions } =
    useViewGetStates();

  return (
    <FilterScope
      filterScopeId="view-filter"
      availableFilterDefinitions={availableFilterDefinitions}
      onFilterSelect={upsertViewFilter}
    >
      <SortScope
        sortScopeId="view-sort"
        availableSortDefinitions={availableSortDefinitions}
        onSortSelect={upsertViewSort}
      >
        <ViewBarEffect />
        <TopBar
          className={className}
          leftComponent={
            <ViewsDropdownButton
              onViewEditModeChange={openOptionsDropdownButton}
              hotkeyScope={{ scope: ViewsHotkeyScope.ListDropdown }}
              optionsDropdownScopeId={optionsDropdownScopeId}
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
      </SortScope>
    </FilterScope>
  );
};
