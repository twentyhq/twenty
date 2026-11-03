import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const coreAgentPermissionsTargetComponentState =
  createAtomComponentState<{ agentId: string; scopeId: string | null } | null>({
    key: 'core-agent-permissions-target',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
