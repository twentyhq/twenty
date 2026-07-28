import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const workspaceSetupChatRequestedWorkspaceIdState = createAtomState<
  string | null
>({
  key: 'workspaceSetupChatRequestedWorkspaceIdState',
  defaultValue: null,
  useSessionStorage: true,
});
