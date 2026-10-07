import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { DashboardFilterChipDropdown } from '@/page-layout/dashboard-filters/components/DashboardFilterChipDropdown';
import { DashboardFilterChipValueSyncEffect } from '@/page-layout/dashboard-filters/components/DashboardFilterChipValueSyncEffect';
import { type DashboardFilterSlotWidgetCounts } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotWidgetCounts';
import { getDashboardFilterChipInstanceId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChipInstanceId';
import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';

type DashboardFilterChipProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
  relationTargetObjectNameSingular: string | undefined;
  widgetCounts: DashboardFilterSlotWidgetCounts;
  onEdit?: () => void;
};

// Each chip owns a filter instance so the existing filter inputs upsert a single scratch RecordFilter there.
export const DashboardFilterChip = ({
  slot,
  representativeBinding,
  relationTargetObjectNameSingular,
  widgetCounts,
  onEdit,
}: DashboardFilterChipProps) => {
  const { currentPageLayout } = useCurrentPageLayoutOrThrow();

  // The same dashboard can be open in the main surface and a side panel; each needs its own dropdown and scratch filter.
  const instanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    getDashboardFilterChipInstanceId({
      pageLayoutId: currentPageLayout.id,
      slotId: slot.id,
    }),
  );

  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <ObjectFilterDropdownComponentInstanceContext.Provider
          value={{ instanceId }}
        >
          <DashboardFilterChipDropdown
            slot={slot}
            representativeBinding={representativeBinding}
            relationTargetObjectNameSingular={relationTargetObjectNameSingular}
            widgetCounts={widgetCounts}
            onEdit={onEdit}
          />
          <DashboardFilterChipValueSyncEffect slotId={slot.id} />
        </ObjectFilterDropdownComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
