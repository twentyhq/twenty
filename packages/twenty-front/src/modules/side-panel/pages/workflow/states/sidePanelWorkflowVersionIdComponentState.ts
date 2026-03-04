import { SidePanelPageComponentInstanceContext } from '@/command-menu/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sidePanelWorkflowVersionIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'command-menu/workflow-version-id',
    defaultValue: undefined,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
