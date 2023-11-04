import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { ObjectFilterDropdownButton } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { ObjectFilterDropdownScope } from '@/ui/object/object-filter-dropdown/scopes/ObjectFilterDropdownScope';
import { FiltersHotkeyScope } from '@/ui/object/object-filter-dropdown/types/FiltersHotkeyScope';
import { ObjectSortDropdownButton } from '@/ui/object/object-sort-dropdown/components/ObjectSortDropdownButton';
import { ObjectSortDropdownScope } from '@/ui/object/object-sort-dropdown/scopes/ObjectSortDropdownScope';

import { useViewScopedStates } from '../hooks/internal/useViewScopedStates';
import { useView } from '../hooks/useView';
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

  const { availableFilterDefinitionsState, availableSortDefinitionsState } =
    useViewScopedStates();

  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const availableSortDefinitions = useRecoilValue(
    availableSortDefinitionsState,
  );

  return (
    <ObjectFilterDropdownScope
      filterScopeId="view-filter"
      availableFilterDefinitions={availableFilterDefinitions}
      onFilterSelect={upsertViewFilter}
    >
      <ObjectSortDropdownScope
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
              <ObjectFilterDropdownButton
                hotkeyScope={{
                  scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
                }}
              />
              <ObjectSortDropdownButton
                hotkeyScope={{
                  scope: FiltersHotkeyScope.ObjectSortDropdownButton,
                }}
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
      </ObjectSortDropdownScope>
    </ObjectFilterDropdownScope>
  );
};
