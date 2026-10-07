import { type MessageDescriptor } from '@lingui/core';
import { type DashboardFilterSlot } from 'twenty-shared/types';

// Built-in slots are module-level constants, so their label is translated at render time.
export type BuiltInDashboardFilterSlot = Omit<DashboardFilterSlot, 'label'> & {
  label: MessageDescriptor;
};
