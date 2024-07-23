import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

export const formatUserVars = (
  userVars: Pick<KeyValuePair, 'key' | 'value' | 'userId' | 'workspaceId'>[],
): Map<string, JSON> => {
  const workspaceUserVarMap = new Map<string, any>();
  const userUserVarMap = new Map<string, any>();
  const userWorkspaceUserVarMap = new Map<string, any>();

  for (const { key, value, userId, workspaceId } of userVars) {
    if (!userId && workspaceId) {
      workspaceUserVarMap.set(key, value);
    } else if (userId && !workspaceId) {
      userUserVarMap.set(key, value);
    } else if (userId && workspaceId) {
      userWorkspaceUserVarMap.set(key, value);
    }
  }

  const formattedUserVars = new Map<string, any>([
    ...workspaceUserVarMap,
    ...userUserVarMap,
    ...userWorkspaceUserVarMap,
  ]);

  return formattedUserVars;
};
