import { type RecordViewsTarget } from '@/side-panel/pages/record-views/types/RecordViewsTarget';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordViewsTargetComponentState =
  createAtomComponentState<RecordViewsTarget | null>({
    key: 'side-panel/record-views-target',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
