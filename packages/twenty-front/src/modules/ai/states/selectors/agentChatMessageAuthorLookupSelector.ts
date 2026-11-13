import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { type AgentChatMessageAuthorLookup } from '@/ai/types/AgentChatMessageAuthorLookup';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatMessageAuthorLookupSelector =
  createAtomSelector<AgentChatMessageAuthorLookup>({
    key: 'agentChatMessageAuthorLookupSelector',
    get: ({ get }) => ({
      workspaceMembers: get(currentWorkspaceMembersState),
      assistantDisplayName: get(aiChatAssistantProfileSelector).displayName,
      currentWorkspace: get(currentWorkspaceState),
    }),
  });
