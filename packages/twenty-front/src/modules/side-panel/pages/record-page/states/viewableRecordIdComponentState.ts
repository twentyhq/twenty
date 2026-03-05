import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/viewable-record-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
