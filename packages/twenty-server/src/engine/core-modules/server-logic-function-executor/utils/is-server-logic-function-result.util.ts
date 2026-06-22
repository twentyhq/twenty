import { type ServerLogicFunctionResult } from 'twenty-shared/application';
import { isLogicFunctionHttpResponse } from 'twenty-shared/types';

export const isServerLogicFunctionResult = (
  value: unknown,
): value is ServerLogicFunctionResult => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { workspaceIds, response } = value as {
    workspaceIds?: unknown;
    response?: unknown;
  };

  if (
    !Array.isArray(workspaceIds) ||
    !workspaceIds.every((id) => typeof id === 'string')
  ) {
    return false;
  }

  if (response !== undefined && !isLogicFunctionHttpResponse(response)) {
    return false;
  }

  return true;
};
