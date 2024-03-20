import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { ObjectFilterDropdownButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { FilterQueryParamsEffect } from '@/views/components/FilterQueryParamsEffect';
import { ViewBarEffect } from '@/views/components/ViewBarEffect';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { ViewBarSortEffect } from '@/views/components/ViewBarSortEffect';
import { ViewScope } from '@/views/scopes/ViewScope';
import { GraphQLView } from '@/views/types/GraphQLView';

import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';
import { ViewsDropdownButton } from './ViewsDropdownButton';

export type ViewBarProps = {
  viewBarId: string;
  className?: string;
  optionsDropdownButton: ReactNode;
  optionsDropdownScopeId: string;
  onCurrentViewChange: (view: GraphQLView | undefined) => void | Promise<void>;
};

export const ViewBar = ({
  viewBarId,
  className,
  optionsDropdownButton,
  optionsDropdownScopeId,
  onCurrentViewChange,
}: ViewBarProps) => {
  const { openDropdown: openOptionsDropdownButton } = useDropdown(
    optionsDropdownScopeId,
  );

  const { objectNamePlural } = useParams();

  const filterDropdownId = 'view-filter';
  const sortDropdownId = 'view-sort';

  return (
    <ViewScope
      viewScopeId={viewBarId}
      onCurrentViewChange={onCurrentViewChange}
    >
      <ViewBarEffect viewBarId={viewBarId} />
      <ViewBarFilterEffect filterDropdownId={filterDropdownId} />
      <ViewBarSortEffect sortDropdownId={sortDropdownId} />
      {!!objectNamePlural && <FilterQueryParamsEffect />}

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
              filterDropdownId={filterDropdownId}
              hotkeyScope={{
                scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
              }}
            />
            <ObjectSortDropdownButton
              sortDropdownId={sortDropdownId}
              hotkeyScope={{
                scope: FiltersHotkeyScope.ObjectSortDropdownButton,
              }}
            />
            {optionsDropdownButton}
          </>
        }
        bottomComponent={
          <ViewBarDetails
            filterDropdownId={filterDropdownId}
            hasFilterButton
            viewBarId={viewBarId}
            rightComponent={
              <UpdateViewButtonGroup
                onViewEditModeChange={openOptionsDropdownButton}
                hotkeyScope={{ scope: ViewsHotkeyScope.CreateDropdown }}
              />
            }
          />
        }
      />
    </ViewScope>
  );
};
