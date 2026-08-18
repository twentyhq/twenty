import { isNonEmptyString } from '@sniptt/guards';
import {
  DEFAULT_CALLER_NAME,
  type LogicFunctionCaller,
} from 'twenty-shared/application';

const isLogicFunctionCaller = (
  value: unknown,
): value is LogicFunctionCaller => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (candidate.type === 'user') {
    const hasValidWorkspaceMemberId =
      candidate.workspaceMemberId === undefined ||
      isNonEmptyString(candidate.workspaceMemberId);

    return (
      isNonEmptyString(candidate.userId) &&
      isNonEmptyString(candidate.userWorkspaceId) &&
      hasValidWorkspaceMemberId
    );
  }

  if (candidate.type === 'apiKey') {
    return isNonEmptyString(candidate.apiKeyId);
  }

  return false;
};

export const getCaller = (): LogicFunctionCaller | null => {
  const serializedCaller = process.env[DEFAULT_CALLER_NAME];

  if (!isNonEmptyString(serializedCaller)) {
    return null;
  }

  try {
    const parsedCaller: unknown = JSON.parse(serializedCaller);

    return isLogicFunctionCaller(parsedCaller) ? parsedCaller : null;
  } catch {
    return null;
  }
};
