import { type MessageDescriptor } from '@lingui/core';
import { type DashboardFilterSlot } from 'twenty-shared/types';

// Built-in slots are declared at module level, before the locale is active, so their labels stay message descriptors until rendered.
export type DashboardFilterSlotDefinition = Omit<
  DashboardFilterSlot,
  'label'
> & {
  label: MessageDescriptor;
};
