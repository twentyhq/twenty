import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';

export const fromUserWorkspaceEntityToFlat = (
  entity: UserWorkspaceEntity,
): FlatUserWorkspace => ({
  id: entity.id,
  workspaceId: entity.workspaceId,
  userId: entity.userId,
  defaultAvatarUrl: entity.defaultAvatarUrl,
  locale: entity.locale,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
  deletedAt: entity.deletedAt?.toISOString() ?? null,
});
