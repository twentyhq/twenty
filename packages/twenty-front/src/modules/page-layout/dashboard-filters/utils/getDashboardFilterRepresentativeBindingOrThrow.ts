import { type DashboardFilterBindingsByWidgetId } from '@/page-layout/dashboard-filters/types/DashboardFilterBindingsByWidgetId';
import { findDashboardFilterRepresentativeBinding } from '@/page-layout/dashboard-filters/utils/findDashboardFilterRepresentativeBinding';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The bar only renders slots the selector kept, and it keeps a slot only once a chart binds it.
export const getDashboardFilterRepresentativeBindingOrThrow = ({
  slotId,
  bindingsByWidgetId,
}: {
  slotId: string;
  bindingsByWidgetId: DashboardFilterBindingsByWidgetId;
}): DashboardFilterBinding => {
  const representativeBinding = findDashboardFilterRepresentativeBinding({
    slotId,
    bindingsByWidgetId,
  });

  if (!isDefined(representativeBinding)) {
    throw new Error(
      `Dashboard filter slot ${slotId} exists without any widget binding it`,
    );
  }

  return representativeBinding;
};
