import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasOpenedWorkspaceSetupChatSidePanelState =
  createAtomState<boolean>({
    key: 'hasOpenedWorkspaceSetupChatSidePanelState',
    defaultValue: false,
  });
