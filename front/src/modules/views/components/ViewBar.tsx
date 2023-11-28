import { ReactNode } from 'react';
import { useRecoilValue } from 'recoil';

import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { ObjectFilterDropdownButton } from '@/ui/object/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { ObjectFilterDropdownScopeInitEffect } from '@/ui/object/object-filter-dropdown/scopes/init-effect/ObjectFilterDropdownScopeInitEffect';
import { FiltersHotkeyScope } from '@/ui/object/object-filter-dropdown/types/FiltersHotkeyScope';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';
import { ViewScope } from '@/views/scopes/ViewScope';
import { ViewField } from '@/views/types/ViewField';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewSort } from '@/views/types/ViewSort';

import { useView } from '../hooks/useView';
import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';
import { ViewBarEffect } from './ViewBarEffect';
import { ViewsDropdownButton } from './ViewsDropdownButton';

export type ViewBarProps = {
  viewId: string;
  className?: string;
  optionsDropdownButton: ReactNode;
  optionsDropdownScopeId: string;
  onViewSortsChange?: (sorts: ViewSort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: ViewFilter[]) => void | Promise<void>;
  onViewFieldsChange?: (fields: ViewField[]) => void | Promise<void>;
};

export const ViewBar = ({
  viewId,
  className,
  optionsDropdownButton,
  optionsDropdownScopeId,
  onViewFieldsChange,
  onViewFiltersChange,
  onViewSortsChange,
}: ViewBarProps) => {
  const { openDropdown: openOptionsDropdownButton } = useDropdown({
    dropdownScopeId: optionsDropdownScopeId,
  });
  const { upsertViewSort, upsertViewFilter } = useView({
    viewScopeId: viewId,
  });

  const filterId = 'view-filter';
  const sortId = 'view-sort';

  const { availableSortDefinitionsState } = useViewScopedStates({
    customViewScopeId: viewId,
  });

  const availableSortDefinitions = useRecoilValue(
    availableSortDefinitionsState,
  );

  return (
    <ViewScope
      viewScopeId={viewId}
      onViewFieldsChange={onViewFieldsChange}
      onViewFiltersChange={onViewFiltersChange}
      onViewSortsChange={onViewSortsChange}
    >
      <ViewBarEffect />
      <ObjectFilterDropdownScopeInitEffect
        filterScopeId={filterId}
        viewId={viewId}
        onFilterSelect={upsertViewFilter}
      />

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
              filterId={filterId}
              hotkeyScope={{
                scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
              }}
            />
            {/* <ObjectSortDropdownButton
              sortId={sortId}
              onSortSelect={upsertViewSort}
              availableSortDefinitions={availableSortDefinitions}
              hotkeyScope={{
                scope: FiltersHotkeyScope.ObjectSortDropdownButton,
              }}
            /> */}
            {optionsDropdownButton}
          </>
        }
        bottomComponent={
          <ViewBarDetails
            filterId={filterId}
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
    </ViewScope>
  );
};
