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

  if (candidate.kind === 'user') {
    return (
      typeof candidate.userId === 'string' &&
      typeof candidate.userWorkspaceId === 'string'
    );
  }

  if (candidate.kind === 'apiKey') {
    return typeof candidate.apiKeyId === 'string';
  }

  return false;
};

export const getCaller = (): LogicFunctionCaller | null => {
  const serializedCaller = process.env[DEFAULT_CALLER_NAME];

  if (!serializedCaller) {
    return null;
  }

  try {
    const parsedCaller: unknown = JSON.parse(serializedCaller);

    return isLogicFunctionCaller(parsedCaller) ? parsedCaller : null;
  } catch {
    return null;
  }
};
