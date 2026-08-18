import { isNonEmptyString } from '@sniptt/guards';
import {
  DEFAULT_CALLER_NAME,
  type LogicFunctionCaller,
} from 'twenty-shared/application';

const isLogicFunctionCaller = (
  value: unknown,
): value is LogicFunctionCaller => {
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return false;
  }

  if (value.type === 'user') {
    return (
      'userId' in value &&
      typeof value.userId === 'string' &&
      'userWorkspaceId' in value &&
      typeof value.userWorkspaceId === 'string' &&
      (!('workspaceMemberId' in value) ||
        value.workspaceMemberId === undefined ||
        typeof value.workspaceMemberId === 'string')
    );
  }

  if (value.type === 'apiKey') {
    return 'apiKeyId' in value && typeof value.apiKeyId === 'string';
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
