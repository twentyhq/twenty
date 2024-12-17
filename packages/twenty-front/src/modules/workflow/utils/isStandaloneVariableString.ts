import { isString } from '@sniptt/guards';

const STANDALONE_VARIABLE_REGEX = /^{{[^{}]+}}$/;

export const isStandaloneVariableString = (value: unknown): value is string => {
  return isString(value) && STANDALONE_VARIABLE_REGEX.test(value);
};
