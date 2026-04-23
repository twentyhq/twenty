import { type KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export const mergeUserVars = <T>(
  userVars: Pick<
    KeyValuePairEntity,
    'key' | 'value' | 'userId' | 'workspaceId'
  >[],
): Map<T, JSON> => {
  const workspaceUserVarMap = new Map<T, JSON>();
  const userUserVarMap = new Map<T, JSON>();
  const userWorkspaceUserVarMap = new Map<T, JSON>();

  for (const { key, value, userId, workspaceId } of userVars) {
    if (!userId && workspaceId) {
      workspaceUserVarMap.set(key as T, value);
    }

    if (userId && !workspaceId) {
      userUserVarMap.set(key as T, value);
    }

    if (userId && workspaceId) {
      userWorkspaceUserVarMap.set(key as T, value);
    }
  }

  const mergedUserVars = new Map<T, JSON>([
    ...workspaceUserVarMap,
    ...userUserVarMap,
    ...userWorkspaceUserVarMap,
  ]);

  return mergedUserVars;
};
