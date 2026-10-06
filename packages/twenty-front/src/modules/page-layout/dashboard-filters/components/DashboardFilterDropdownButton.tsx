import { DashboardFilterChip } from '@/page-layout/dashboard-filters/components/DashboardFilterChip';
import { DashboardFilterRelationChip } from '@/page-layout/dashboard-filters/components/DashboardFilterRelationChip';
import { DashboardFilterValueDropdown } from '@/page-layout/dashboard-filters/components/DashboardFilterValueDropdown';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { getDashboardFilterChipComponentInstanceId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterChipComponentInstanceId';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

type DashboardFilterDropdownButtonProps = {
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding;
  boundChartCount: number;
  chartCount: number;
};

export const DashboardFilterDropdownButton = ({
  slot,
  representativeBinding,
  boundChartCount,
  chartCount,
}: DashboardFilterDropdownButtonProps) => {
  const pageLayoutInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const chipInstanceId = getDashboardFilterChipComponentInstanceId({
    pageLayoutInstanceId,
    slotId: slot.id,
  });

  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const { closeDropdown } = useCloseDropdown();

  const handleValueChange = (value: DashboardFilterValue) => {
    setDashboardFilterValues((previousDashboardFilterValues) => ({
      ...previousDashboardFilterValues,
      [slot.id]: value,
    }));
  };

  const handleRemove = (dropdownId: string) => {
    closeDropdown(dropdownId);

    setDashboardFilterValues((previousDashboardFilterValues) =>
      removePropertiesFromRecord(previousDashboardFilterValues, [slot.id]),
    );
  };

  return (
    <DashboardFilterValueDropdown
      slot={slot}
      representativeBinding={representativeBinding}
      value={dashboardFilterValues[slot.id]}
      onValueChange={handleValueChange}
      instanceId={chipInstanceId}
      dropdownOffset={{ y: 8, x: 0 }}
      renderClickableComponent={({
        currentRecordFilter,
        labelValue,
        Icon,
        dropdownId,
        onClick,
      }) =>
        isDefined(currentRecordFilter) &&
        currentRecordFilter.type === 'RELATION' ? (
          <DashboardFilterRelationChip
            slot={slot}
            recordFilter={currentRecordFilter}
            Icon={Icon}
            testId={chipInstanceId}
            boundChartCount={boundChartCount}
            chartCount={chartCount}
            onClick={onClick}
            onRemove={() => handleRemove(dropdownId)}
          />
        ) : (
          <DashboardFilterChip
            slot={slot}
            labelValue={labelValue}
            Icon={Icon}
            testId={chipInstanceId}
            boundChartCount={boundChartCount}
            chartCount={chartCount}
            onClick={onClick}
            onRemove={() => handleRemove(dropdownId)}
          />
        )
      }
    />
  );
};
