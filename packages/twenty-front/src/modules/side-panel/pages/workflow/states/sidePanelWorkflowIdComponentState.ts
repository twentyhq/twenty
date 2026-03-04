import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowIdComponentState = createAtomComponentState<
  string | undefined
>({
  key: 'command-menu/workflow-id',
  defaultValue: undefined,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
