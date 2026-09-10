import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasRequestedWorkspaceSetupChatState = createAtomState<boolean>({
  key: 'hasRequestedWorkspaceSetupChatState',
  defaultValue: false,
});
