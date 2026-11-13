import { isDefined } from 'twenty-shared/utils';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getAgentChatThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated-metadata/graphql';

// The record API refuses a suspended workspace, so its chats never load
export const agentChatRecentThreadsLoadingSelector =
  createAtomSelector<boolean>({
    key: 'agentChatRecentThreadsLoadingSelector',
    get: ({ get }) =>
      !isDefined(
        get(
          agentChatThreadListFamilyState,
          getAgentChatThreadListSourceKey(AGENT_CHAT_RECENT_THREAD_LIST_SOURCE),
        ),
      ) &&
      get(permissionFlagMapSelector)[PermissionFlagType.AI] &&
      get(currentWorkspaceState)?.activationStatus !==
        WorkspaceActivationStatus.SUSPENDED,
  });
