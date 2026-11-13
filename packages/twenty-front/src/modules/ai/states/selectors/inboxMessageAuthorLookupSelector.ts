import { aiChatAssistantProfileSelector } from '@/ai/states/selectors/aiChatAssistantProfileSelector';
import { type InboxMessageAuthorLookup } from '@/ai/types/InboxMessageAuthorLookup';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxMessageAuthorLookupSelector =
  createAtomSelector<InboxMessageAuthorLookup>({
    key: 'inboxMessageAuthorLookupSelector',
    get: ({ get }) => ({
      workspaceMembers: get(currentWorkspaceMembersState),
      assistantDisplayName: get(aiChatAssistantProfileSelector).displayName,
      currentWorkspace: get(currentWorkspaceState),
    }),
  });
