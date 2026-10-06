import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Carries the slot the detail sub page edits, the way pageLayoutEditingWidgetIdComponentState carries the widget for widget settings pages.
export const dashboardFilterEditingSlotIdComponentState =
  createAtomComponentState<string | null>({
    key: 'dashboardFilterEditingSlotIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
