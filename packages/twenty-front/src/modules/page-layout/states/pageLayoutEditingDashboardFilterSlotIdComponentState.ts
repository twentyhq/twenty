import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutEditingDashboardFilterSlotIdComponentState =
  createAtomComponentState<string | null>({
    key: 'pageLayoutEditingDashboardFilterSlotIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
