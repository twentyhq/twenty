import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { DashboardFilterDefaultValueDropdownContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterDefaultValueDropdownContent';
import { DashboardFilterDefaultValueSyncEffect } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterDefaultValueSyncEffect';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

type DashboardFilterDefaultValueDropdownProps = {
  pageLayoutId: string;
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding | undefined;
};

// Same shape as the chip: a dedicated filter instance holds one scratch RecordFilter the reused inputs write to.
export const DashboardFilterDefaultValueDropdown = ({
  pageLayoutId,
  slot,
  representativeBinding,
}: DashboardFilterDefaultValueDropdownProps) => {
  const instanceId = `dashboard-filter-default-${pageLayoutId}-${slot.id}`;

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <DashboardFilterDefaultValueDropdownContent
            slot={slot}
            representativeBinding={representativeBinding}
          />
          <DashboardFilterDefaultValueSyncEffect
            pageLayoutId={pageLayoutId}
            slot={slot}
          />
        </ObjectFilterDropdownComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
