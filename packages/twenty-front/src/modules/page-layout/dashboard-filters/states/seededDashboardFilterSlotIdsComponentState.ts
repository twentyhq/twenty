import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Slots whose default was already offered this open; a slot listed here is never seeded again, so clearing it stays cleared.
export const seededDashboardFilterSlotIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'seededDashboardFilterSlotIdsComponentState',
    defaultValue: [],
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
