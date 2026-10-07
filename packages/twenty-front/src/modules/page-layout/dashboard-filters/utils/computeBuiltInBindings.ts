import { computeBuiltInDateBindings } from '@/page-layout/dashboard-filters/utils/computeBuiltInDateBindings';
import {
  type ComputeBuiltInOwnerBindingsArgs,
  computeBuiltInOwnerBindings,
} from '@/page-layout/dashboard-filters/utils/computeBuiltInOwnerBindings';
import { type DashboardFilterBinding } from 'twenty-shared/types';

export type ComputeBuiltInBindingsArgs = ComputeBuiltInOwnerBindingsArgs;

export const computeBuiltInBindings = (
  args: ComputeBuiltInBindingsArgs,
): Record<string, Record<string, DashboardFilterBinding | null>> => {
  const dateBindingsByWidgetId = computeBuiltInDateBindings(args);
  const ownerBindingsByWidgetId = computeBuiltInOwnerBindings(args);

  const widgetIds = new Set([
    ...Object.keys(dateBindingsByWidgetId),
    ...Object.keys(ownerBindingsByWidgetId),
  ]);

  return Object.fromEntries(
    Array.from(widgetIds).map((widgetId) => [
      widgetId,
      {
        ...dateBindingsByWidgetId[widgetId],
        ...ownerBindingsByWidgetId[widgetId],
      },
    ]),
  );
};
