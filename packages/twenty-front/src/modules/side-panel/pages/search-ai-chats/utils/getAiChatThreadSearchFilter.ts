import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { escapeForIlike, isNonEmptyArray } from 'twenty-shared/utils';

import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

export const getAiChatThreadSearchFilter = ({
  searchTerm,
  workspaceMembers,
  currentWorkspaceMemberId,
  isDirectMessageEnabled,
}: {
  searchTerm: string;
  workspaceMembers: readonly Pick<
    PartialWorkspaceMember,
    'id' | 'name' | 'userEmail'
  >[];
  currentWorkspaceMemberId: string | undefined;
  isDirectMessageEnabled: boolean;
}): RecordGqlOperationFilter => {
  const titleFilter = {
    title: { ilike: `%${escapeForIlike(searchTerm)}%` },
  };

  if (!isDirectMessageEnabled) {
    return titleFilter;
  }

  const matchingWorkspaceMemberIds = filterBySearchQuery({
    items: workspaceMembers.filter(({ id }) => id !== currentWorkspaceMemberId),
    searchQuery: searchTerm,
    getSearchableValues: (workspaceMember) => [
      getWorkspaceMemberNameOrEmail(workspaceMember),
    ],
  }).map(({ id }) => id);
  const standardConversationFilter = {
    and: [
      {
        not: {
          conversationType: {
            eq: AgentChatThreadConversationType.DIRECT_MESSAGE,
          },
        },
      },
      titleFilter,
    ],
  };

  if (!isNonEmptyArray(matchingWorkspaceMemberIds)) {
    return standardConversationFilter;
  }

  return {
    or: [
      standardConversationFilter,
      {
        and: [
          {
            conversationType: {
              eq: AgentChatThreadConversationType.DIRECT_MESSAGE,
            },
          },
          {
            or: [
              {
                directMessageFirstWorkspaceMemberId: {
                  in: matchingWorkspaceMemberIds,
                },
              },
              {
                directMessageSecondWorkspaceMemberId: {
                  in: matchingWorkspaceMemberIds,
                },
              },
            ],
          },
        ],
      },
    ],
  };
};
