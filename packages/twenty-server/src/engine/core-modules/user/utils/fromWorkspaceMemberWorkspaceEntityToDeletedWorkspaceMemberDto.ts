import { DeletedWorkspaceMember } from 'src/engine/core-modules/user/dtos/deleted-workspace-member.dto';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type FromWorkspaceMemberWorkspaceEntityToDeletedWorkspaceMemberDtoArgs = {
  workspaceMemberWorkspaceEntity: WorkspaceMemberWorkspaceEntity;
  userWorkspaceId: string;
};
export const fromWorkspaceMemberWorkspaceEntityToDeletedWorkspaceMemberDto = ({
  userWorkspaceId,
  workspaceMemberWorkspaceEntity: { avatarUrl, id, name, userEmail },
}: FromWorkspaceMemberWorkspaceEntityToDeletedWorkspaceMemberDtoArgs): DeletedWorkspaceMember => ({
  avatarUrl,
  id,
  name,
  userEmail,
  userWorkspaceId,
});
