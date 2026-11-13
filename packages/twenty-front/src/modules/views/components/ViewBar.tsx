import { type ReactNode } from 'react';

import { ObjectSortDropdownButton } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdownButton';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { TopBar } from '@/ui/layout/top-bar/components/TopBar';
import { QueryParamsFiltersEffect } from '@/views/components/QueryParamsFiltersEffect';
import { QueryParamsSortsEffect } from '@/views/components/QueryParamsSortsEffect';
import { ViewBarPageTitle } from '@/views/components/ViewBarPageTitle';
import { RecordIndexTabs } from '@/object-record/record-index-tab/components/RecordIndexTabs';
import { ViewPickerDropdown } from '@/views/view-picker/components/ViewPickerDropdown';

import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { getObjectSortDropdownId } from '@/object-record/object-sort-dropdown/utils/getObjectSortDropdownId';
import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { QueryParamsCleanupEffect } from '@/views/components/QueryParamsCleanupEffect';
import { ViewBarAnyFieldFilterEffect } from '@/views/components/ViewBarAnyFieldFilterEffect';
import { ViewBarFilterDropdown } from '@/views/components/ViewBarFilterDropdown';
import { ViewBarRecordFieldEffect } from '@/views/components/ViewBarRecordFieldEffect';
import { ViewBarRecordFilterEffect } from '@/views/components/ViewBarRecordFilterEffect';
import { ViewBarRecordFilterGroupEffect } from '@/views/components/ViewBarRecordFilterGroupEffect';
import { ViewBarRecordSortEffect } from '@/views/components/ViewBarRecordSortEffect';
import { getViewBarFilterDropdownId } from '@/views/utils/getViewBarFilterDropdownId';
import { UpdateViewButtonGroup } from './UpdateViewButtonGroup';
import { ViewBarDetails } from './ViewBarDetails';

type ViewBarProps = {
  viewBarId: string;
  className?: string;
  optionsDropdownButton: ReactNode;
  isReadOnly?: boolean;
};

export const ViewBar = ({
  viewBarId,
  className,
  optionsDropdownButton,
  isReadOnly = false,
}: ViewBarProps) => {
  const { objectNamePlural, recordIndexId } = useRecordIndexContextOrThrow();

  if (!objectNamePlural) {
    return;
  }

  const leftComponent = (
    <>
      <ViewPickerDropdown />
      <RecordIndexTabs />
    </>
  );

  if (isReadOnly) {
    return <TopBar className={className} leftComponent={leftComponent} />;
  }

  return (
    <ObjectSortDropdownComponentInstanceContext.Provider
      value={{ instanceId: getObjectSortDropdownId(recordIndexId) }}
    >
      <ViewBarRecordFilterGroupEffect />
      <ViewBarAnyFieldFilterEffect />
      <ViewBarRecordFieldEffect />
      <ViewBarRecordFilterEffect />
      <ViewBarRecordSortEffect />
      <QueryParamsFiltersEffect />
      <QueryParamsSortsEffect />
      <QueryParamsCleanupEffect />
      <ViewBarPageTitle />
      <TopBar
        className={className}
        leftComponent={leftComponent}
        rightComponent={
          <>
            <ObjectFilterDropdownComponentInstanceContext.Provider
              value={{ instanceId: getViewBarFilterDropdownId(recordIndexId) }}
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
