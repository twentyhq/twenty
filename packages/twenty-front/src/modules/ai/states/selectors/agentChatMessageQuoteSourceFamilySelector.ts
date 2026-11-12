import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { getAgentChatMessageQuoteSource } from '@/ai/utils/getAgentChatMessageQuoteSource';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatMessageQuoteSourceFamilySelector =
  createAtomFamilySelector<
    Nullable<{
      messageId: string;
      sender: PartialWorkspaceMember | undefined;
      authorName: string;
      excerpt: string;
    }>,
    { threadId: Nullable<string>; messageId: Nullable<string> }
  >({
    key: 'agentChatMessageQuoteSourceFamilySelector',
    get:
      ({ threadId, messageId }) =>
      ({ get }) => {
        const message = get(agentChatMessagesFamilyState, {
          threadId: threadId ?? null,
        }).find(({ id }) => id === messageId);

        if (!isDefined(message)) {
          return null;
        }

        return {
          messageId: message.id,
          ...getAgentChatMessageQuoteSource({
            message,
            workspaceMembers: get(currentWorkspaceMembersState),
          }),
        };
      },
  });
