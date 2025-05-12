import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import {
  WorkspaceMemberDateFormatEnum,
  WorkspaceMemberTimeFormatEnum,
  WorkspaceMemberWorkspaceEntity,
} from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const fromWorkspaceMemberWorkspaceEntityToWorkspaceMemberDto = ({
  avatarUrl,
  colorScheme,
  dateFormat,
  id,
  locale,
  name,
  timeFormat,
  timeZone,
  userEmail,
}: WorkspaceMemberWorkspaceEntity): WorkspaceMember => ({
  avatarUrl,
  colorScheme,
  dateFormat: dateFormat as WorkspaceMemberDateFormatEnum,
  id,
  locale,
  name,
  timeFormat: timeFormat as WorkspaceMemberTimeFormatEnum,
  timeZone,
  userEmail,
  roles,
  userWorkspaceId,
});
