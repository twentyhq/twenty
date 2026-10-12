import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated-metadata/graphql';

// The record API refuses a suspended workspace, so its chats never load
export const agentChatThreadsLoadingSelector = createAtomSelector<boolean>({
  key: 'agentChatThreadsLoadingSelector',
  get: ({ get }) =>
    get(agentChatThreadListState) === null &&
    get(permissionFlagMapSelector)[PermissionFlagType.AI] &&
    get(currentWorkspaceState)?.activationStatus !==
      WorkspaceActivationStatus.SUSPENDED,
});
