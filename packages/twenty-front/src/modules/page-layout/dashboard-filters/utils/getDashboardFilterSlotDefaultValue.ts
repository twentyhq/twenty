import { isDashboardFilterValueSet } from '@/page-layout/dashboard-filters/utils/isDashboardFilterValueSet';
import {
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Built-in slots carry a default operand but no value, so only a default that would filter counts.
export const getDashboardFilterSlotDefaultValue = (
  slot: DashboardFilterSlot,
): DashboardFilterValue | undefined => {
  if (!isDefined(slot.defaultOperand)) {
    return undefined;
  }

  const defaultValue: DashboardFilterValue = {
    operand: slot.defaultOperand,
    value: slot.defaultValue ?? '',
  };

  return isDashboardFilterValueSet(defaultValue) ? defaultValue : undefined;
};
