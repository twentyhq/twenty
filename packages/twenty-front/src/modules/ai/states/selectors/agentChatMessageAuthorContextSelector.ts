import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { type AgentChatMessageAuthorContext } from '@/ai/types/AgentChatMessageAuthorContext';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatMessageAuthorContextSelector =
  createAtomSelector<AgentChatMessageAuthorContext>({
    key: 'agentChatMessageAuthorContextSelector',
    get: ({ get }) => ({
      workspaceMembers: get(currentWorkspaceMembersState),
      assistantDisplayName: get(aiChatAssistantProfileSelector).displayName,
      currentWorkspace: get(currentWorkspaceState),
    }),
  });
