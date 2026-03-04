import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableRecordIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'command-menu/viewable-record-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
