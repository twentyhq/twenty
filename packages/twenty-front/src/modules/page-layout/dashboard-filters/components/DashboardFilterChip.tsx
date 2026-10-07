import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { DashboardFilterChipDropdown } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdown';
import { DashboardFilterChipValueSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterChipValueSyncEffect';
import { getDashboardFilterChipInstanceId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChipInstanceId';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

type DashboardFilterChipProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
};

// Each chip owns a filter instance so the existing filter inputs upsert a single scratch RecordFilter there.
export const DashboardFilterChip = ({
  slot,
  representativeBinding,
}: DashboardFilterChipProps) => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  const instanceId = getDashboardFilterChipInstanceId({
    pageLayoutId: currentPageLayout.id,
    slotId: slot.id,
  });

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <DashboardFilterChipDropdown
            slot={slot}
            representativeBinding={representativeBinding}
          />
          <DashboardFilterChipValueSyncEffect slotId={slot.id} />
        </ObjectFilterDropdownComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
