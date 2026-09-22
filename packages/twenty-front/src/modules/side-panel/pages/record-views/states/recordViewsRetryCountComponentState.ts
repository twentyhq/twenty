import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordViewsRetryCountComponentState =
  createAtomComponentState<number>({
    key: 'side-panel/record-views-retry-count',
    defaultValue: 0,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
