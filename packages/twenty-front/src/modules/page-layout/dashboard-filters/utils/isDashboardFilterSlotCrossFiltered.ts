import { type DashboardFilterValue } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isDashboardFilterSlotCrossFiltered = ({
  slotId,
  dashboardFilterValues,
  dashboardFilterCrossFilterValues,
}: {
  slotId: string;
  dashboardFilterValues: Record<string, DashboardFilterValue | undefined>;
  dashboardFilterCrossFilterValues: Record<
    string,
    DashboardFilterValue | undefined
  >;
}): boolean => {
  const value = dashboardFilterValues[slotId];
  const crossFilterValue = dashboardFilterCrossFilterValues[slotId];

  return (
    isDefined(value) &&
    isDefined(crossFilterValue) &&
    value.operand === crossFilterValue.operand &&
    value.value === crossFilterValue.value
  );
};
