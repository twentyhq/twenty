import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

// Queue membership is stored against the core identity rather than the
// workspace member record, so a member with no user behind it cannot be added.
export const useWorkspaceMemberOptions = () => {
  const { records, loading } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const workspaceMemberOptions = useMemo(
    () =>
      records
        .filter((workspaceMember) => isDefined(workspaceMember.userWorkspaceId))
        .map((workspaceMember) => ({
          userWorkspaceId: workspaceMember.userWorkspaceId as string,
          label: [
            workspaceMember.name?.firstName,
            workspaceMember.name?.lastName,
          ]
            .filter(isDefined)
            .join(' ')
            .trim(),
          avatarUrl: workspaceMember.avatarUrl ?? undefined,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [records],
  );

  return { workspaceMemberOptions, loading };
};
