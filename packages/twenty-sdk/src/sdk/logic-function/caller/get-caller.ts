import {
  DEFAULT_CALLER_NAME,
  type LogicFunctionCaller,
} from 'twenty-shared/application';

export const getCaller = (): LogicFunctionCaller | null => {
  const serializedCaller = process.env[DEFAULT_CALLER_NAME];

  if (!serializedCaller) {
    return null;
  }

  try {
    return JSON.parse(serializedCaller) as LogicFunctionCaller;
  } catch {
    return null;
  }
};
