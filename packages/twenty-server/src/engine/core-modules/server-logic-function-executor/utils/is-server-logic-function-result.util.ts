import { type ServerLogicFunctionResult } from 'twenty-shared/application';

export const isServerLogicFunctionResult = (
  value: unknown,
): value is ServerLogicFunctionResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const workspaceIds = (value as { workspaceIds?: unknown }).workspaceIds;

  return (
    Array.isArray(workspaceIds) &&
    workspaceIds.every((id) => typeof id === 'string')
  );
};
