import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordsViewIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/viewable-record-index-view-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
