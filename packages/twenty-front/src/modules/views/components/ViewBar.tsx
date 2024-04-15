import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { ObjectFilterDropdownButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { TopBar } from '@/ui/layout/top-bar/TopBar';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { QueryParamsFiltersEffect } from '@/views/components/QueryParamsFiltersEffect';
import { QueryParamsViewIdEffect } from '@/views/components/QueryParamsViewIdEffect';
import { ViewBarEffect } from '@/views/components/ViewBarEffect';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { ViewBarSortEffect } from '@/views/components/ViewBarSortEffect';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewScope } from '@/views/scopes/ViewScope';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';
import { capitalize } from '~/utils/string/capitalize';

import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';

export type ViewBarProps = {
  viewBarId: string;
  className?: string;
  optionsDropdownButton: ReactNode;
  onCurrentViewChange: (view: GraphQLView | undefined) => void | Promise<void>;
};

export const ViewBar = ({
  viewBarId,
  className,
  optionsDropdownButton,
  onCurrentViewChange,
}: ViewBarProps) => {
  const { objectNamePlural } = useParams();

  const { currentViewWithCombinedFiltersAndSorts: currentView } =
    useGetCurrentView(viewBarId);

  const filterDropdownId = 'view-filter';
  const sortDropdownId = 'view-sort';

  if (!objectNamePlural) {
    return;
  }

  const pageTitle = currentView?.name
    ? `${currentView?.name} - ${capitalize(objectNamePlural)}`
    : capitalize(objectNamePlural);

  return (
    <ViewScope
      viewScopeId={viewBarId}
      onCurrentViewChange={onCurrentViewChange}
    >
      <ViewBarEffect viewBarId={viewBarId} />
      <ViewBarFilterEffect filterDropdownId={filterDropdownId} />
      <ViewBarSortEffect sortDropdownId={sortDropdownId} />
      <QueryParamsFiltersEffect />
      <QueryParamsViewIdEffect />

      <PageTitle title={pageTitle} />
      <TopBar
        className={className}
        leftComponent={
          <>
            <ViewPickerDropdown />
          </>
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
                hotkeyScope={{
                  scope: ViewsHotkeyScope.UpdateViewButtonDropdown,
                }}
              />
            }
          />
        }
      />
    </ViewScope>
  );
};
