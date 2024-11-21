import { isDefined } from 'twenty-ui';

export const extractVariableLabel = (rawVariable: string) => {
  const variableWithoutBrackets = rawVariable.replace(
    /\{\{([^{}]+)\}\}/g,
    (_, variable) => {
      return variable;
    },
  );

  const parts = variableWithoutBrackets.split('.');
  const displayText = parts.at(-1);

  if (!isDefined(displayText)) {
    throw new Error('Expected to find at least one splitted chunk.');
  }

  return displayText;
};
