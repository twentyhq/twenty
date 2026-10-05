import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const WORKSPACE_MEMBER_MENTION_SEARCH_LIMIT = 50;

export const useWorkspaceMemberMentionSearch = () => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const searchWorkspaceMembers = useCallback(
    (query: string): MentionSearchResult[] => {
      const normalizedQuery = query.trim().toLowerCase();

      return currentWorkspaceMembers
        .map((workspaceMember) => ({
          workspaceMember,
          fullName:
            `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim(),
        }))
        .filter(({ workspaceMember, fullName }) =>
          `${fullName} ${workspaceMember.userEmail}`
            .toLowerCase()
            .includes(normalizedQuery),
        )
        .slice(0, WORKSPACE_MEMBER_MENTION_SEARCH_LIMIT)
        .map(({ workspaceMember, fullName }) => ({
          recordId: workspaceMember.id,
          objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
          objectLabelSingular: workspaceMember.userEmail,
          objectLabelPlural: t`Teammates`,
          label: fullName || workspaceMember.userEmail,
          imageUrl: workspaceMember.avatarUrl ?? '',
        }));
    },
    [currentWorkspaceMembers, t],
  );

  return { searchWorkspaceMembers };
};
