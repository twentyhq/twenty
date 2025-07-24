import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { TopBar } from '@/ui/layout/top-bar/components/TopBar';
import { QueryParamsFiltersEffect } from '@/views/components/QueryParamsFiltersEffect';
import { ViewBarPageTitle } from '@/views/components/ViewBarPageTitle';
import { ViewBarSkeletonLoader } from '@/views/components/ViewBarSkeletonLoader';
import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';

import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { VIEW_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ViewSortDropdownId';
import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { ViewBarAnyFieldFilterEffect } from '@/views/components/ViewBarAnyFieldFilterEffect';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import { ViewBarRecordFilterEffect } from '@/views/components/ViewBarRecordFilterEffect';
import { ViewBarRecordFilterGroupEffect } from '@/views/components/ViewBarRecordFilterGroupEffect';
import { ViewBarRecordSortEffect } from '@/views/components/ViewBarRecordSortEffect';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';

type ViewBarProps = {
  viewBarId: string;
  className?: string;
  optionsDropdownButton: ReactNode;
};

export const ViewBar = ({
  viewBarId,
  className,
  optionsDropdownButton,
}: ViewBarProps) => {
  const { objectNamePlural } = useParams();
  const loading = useIsPrefetchLoading();

  if (!objectNamePlural) {
    return;
  }

  return (
    <ObjectSortDropdownComponentInstanceContext.Provider
      value={{ instanceId: VIEW_SORT_DROPDOWN_ID }}
    >
      <ViewBarRecordFilterGroupEffect />
      <ViewBarAnyFieldFilterEffect />
      <ViewBarRecordFilterEffect />
      <ViewBarRecordSortEffect />
      <QueryParamsFiltersEffect />
      <ViewBarPageTitle />
      <TopBar
        className={className}
        leftComponent={
          loading ? <ViewBarSkeletonLoader /> : <ViewPickerDropdown />
        }
        rightComponent={
          <>
            <ObjectFilterDropdownComponentInstanceContext.Provider
              value={{ instanceId: VIEW_BAR_FILTER_DROPDOWN_ID }}
            >
              <ViewBarFilterDropdown />
            </ObjectFilterDropdownComponentInstanceContext.Provider>
            <ObjectSortDropdownButton />
            {optionsDropdownButton}
          </>
        }
        bottomComponent={
          <ViewBarDetails
            hasFilterButton
            viewBarId={viewBarId}
            objectNamePlural={objectNamePlural}
            rightComponent={<UpdateViewButtonGroup />}
          />
        }
      />
    </ObjectSortDropdownComponentInstanceContext.Provider>
  );
};
