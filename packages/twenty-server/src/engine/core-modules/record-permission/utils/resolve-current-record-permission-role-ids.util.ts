import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';
import { type RecordPermissionAuthorityIdentity } from 'src/engine/core-modules/record-permission/types/record-permission-authority-identity.type';

export const resolveCurrentRecordPermissionRoleIds = async ({
  dataSource,
  authContext,
}: {
  dataSource: DataSource;
  authContext: RecordPermissionAuthorityIdentity;
}): Promise<string[] | null> => {
  if (authContext.type === 'system') return [];
  if (authContext.type === 'pendingActivationUser') return null;
  const userWorkspaceId =
    authContext.type === 'user' ? authContext.userWorkspaceId : null;
  const apiKeyId = authContext.type === 'apiKey' ? authContext.apiKey.id : null;
  const agentId =
    authContext.type === 'user' ||
    authContext.type === 'application' ||
    authContext.type === 'agent'
      ? authContext.agentId
      : undefined;
  const targets: {
    roleId: string;
    userWorkspaceId: string | null;
    apiKeyId: string | null;
    agentId: string | null;
  }[] = await dataSource.query(
    'SELECT "roleId", "userWorkspaceId", "apiKeyId", "agentId" FROM core."roleTarget" WHERE "workspaceId" = $1 AND ("userWorkspaceId" = $2 OR "apiKeyId" = $3 OR "agentId" = $4)',
    [authContext.workspace.id, userWorkspaceId, apiKeyId, agentId ?? null],
  );
  if (
    (isDefined(userWorkspaceId) &&
      !targets.some((target) => target.userWorkspaceId === userWorkspaceId)) ||
    (isDefined(apiKeyId) &&
      !targets.some((target) => target.apiKeyId === apiKeyId)) ||
    (isDefined(agentId) &&
      !targets.some((target) => target.agentId === agentId))
  )
    return null;
  const roleIds = targets.map((target) => target.roleId);
  const application =
    authContext.type === 'user' || authContext.type === 'application'
      ? authContext.application
      : undefined;
  if (isDefined(application)) {
    const [current]: { defaultRoleId: string | null }[] =
      await dataSource.query(
        'SELECT "defaultRoleId" FROM core.application WHERE id = $1 AND "workspaceId" = $2',
        [application.id, authContext.workspace.id],
      );
    if (
      !isDefined(current) ||
      (authContext.type === 'application' && !isDefined(current.defaultRoleId))
    )
      return null;
    if (isDefined(current.defaultRoleId)) roleIds.push(current.defaultRoleId);
  }
  return [...new Set(roleIds)];
};
