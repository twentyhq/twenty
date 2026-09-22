import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordViewsTargetComponentState = createAtomComponentState<{
  objectNameSingular: string;
  recordId: string;
} | null>({
  key: 'side-panel/record-views-target',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
