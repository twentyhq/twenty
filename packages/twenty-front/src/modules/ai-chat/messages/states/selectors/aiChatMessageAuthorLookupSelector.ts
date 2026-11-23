import { isDefined } from 'twenty-shared/utils';

import { aiChatAssistantProfileSelector } from '@/ai-chat/states/selectors/aiChatAssistantProfileSelector';
import { type AiChatMessageAuthorLookup } from '@/ai-chat/messages/types/AiChatMessageAuthorLookup';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const aiChatMessageAuthorLookupSelector =
  createAtomSelector<AiChatMessageAuthorLookup>({
    key: 'aiChatMessageAuthorLookupSelector',
    get: ({ get }) => {
      const currentWorkspace = get(currentWorkspaceState);

      return {
        workspaceMembers: get(currentWorkspaceMembersState),
        assistantDisplayName: get(aiChatAssistantProfileSelector).displayName,
        currentWorkspace: isDefined(currentWorkspace)
          ? {
              installedApplications: currentWorkspace.installedApplications,
              workspaceCustomApplication:
                currentWorkspace.workspaceCustomApplication,
            }
          : currentWorkspace,
      };
    },
    areEqual: (previous, next) =>
      previous.workspaceMembers === next.workspaceMembers &&
      previous.assistantDisplayName === next.assistantDisplayName &&
      previous.currentWorkspace?.installedApplications ===
        next.currentWorkspace?.installedApplications &&
      previous.currentWorkspace?.workspaceCustomApplication ===
        next.currentWorkspace?.workspaceCustomApplication,
  });
