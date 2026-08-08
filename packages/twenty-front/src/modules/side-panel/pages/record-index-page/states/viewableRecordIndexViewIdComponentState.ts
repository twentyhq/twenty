import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordIndexViewIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/viewable-record-index-view-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
