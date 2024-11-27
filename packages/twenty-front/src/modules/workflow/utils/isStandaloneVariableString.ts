import { isString } from '@sniptt/guards';

const STANDALONE_VARIABLE = /^{{[^{}]+}}$/;

export const isStandaloneVariableString = (value: unknown): value is string => {
  return isString(value) && STANDALONE_VARIABLE.test(value);
};
