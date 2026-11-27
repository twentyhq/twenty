import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

export const getWorkspaceMemberNameById = (
  workspaceMembers: Pick<WorkspaceMember, 'id' | 'name' | 'userEmail'>[],
) =>
  new Map(
    workspaceMembers.map((workspaceMember) => [
      workspaceMember.id,
      getWorkspaceMemberNameOrEmail(workspaceMember),
    ]),
  );
