import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { ObjectFilterDropdownButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownButton';
import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';

import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { TopBar } from '@/ui/layout/top-bar/components/TopBar';
import { QueryParamsFiltersEffect } from '@/views/components/QueryParamsFiltersEffect';
import { QueryParamsViewIdEffect } from '@/views/components/QueryParamsViewIdEffect';
import { ViewBarEffect } from '@/views/components/ViewBarEffect';
import { ViewBarFilterEffect } from '@/views/components/ViewBarFilterEffect';
import { ViewBarPageTitle } from '@/views/components/ViewBarPageTitle';
import { ViewBarSkeletonLoader } from '@/views/components/ViewBarSkeletonLoader';
import { ViewBarSortEffect } from '@/views/components/ViewBarSortEffect';
import { GraphQLView } from '@/views/types/GraphQLView';
import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';

import { ViewsHotkeyScope } from '../types/ViewsHotkeyScope';

import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { VIEW_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ViewSortDropdownId';
import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { ViewEventContext } from '@/views/events/contexts/ViewEventContext';
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

  const filterDropdownId = 'view-filter';

  const loading = useIsPrefetchLoading();

  if (!objectNamePlural) {
    return;
  }

  return (
    <ObjectSortDropdownComponentInstanceContext.Provider
      value={{ instanceId: VIEW_SORT_DROPDOWN_ID }}
    >
      <ViewEventContext.Provider value={{ onCurrentViewChange }}>
        <ViewBarEffect viewBarId={viewBarId} />
        <ViewBarFilterEffect filterDropdownId={filterDropdownId} />
        <ViewBarSortEffect />
        <QueryParamsFiltersEffect />
        <QueryParamsViewIdEffect />

        <ViewBarPageTitle viewBarId={viewBarId} />
        <TopBar
          className={className}
          leftComponent={
            loading ? <ViewBarSkeletonLoader /> : <ViewPickerDropdown />
          }
          rightComponent={
            <>
              <ObjectFilterDropdownButton
                filterDropdownId={filterDropdownId}
                hotkeyScope={{
                  scope: FiltersHotkeyScope.ObjectFilterDropdownButton,
                }}
              />
              <ObjectSortDropdownButton
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
              objectNamePlural={objectNamePlural}
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
      </ViewEventContext.Provider>
    </ObjectSortDropdownComponentInstanceContext.Provider>
  );
};
