import { isString } from '@sniptt/guards';

export const readStringOption = (
  options: Record<string, unknown>,
  optionName: string,
) => {
  const value = options[optionName];

  return isString(value) ? value : undefined;
};

export const readBooleanOption = (
  options: Record<string, unknown>,
  optionName: string,
) => options[optionName] === true;

export const readStringArgument = (
  commandArguments: unknown[],
  argumentIndex: number,
) => {
  const value = commandArguments[argumentIndex];

  return isString(value) ? value : undefined;
};
