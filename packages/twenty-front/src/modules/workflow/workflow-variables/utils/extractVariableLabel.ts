import { isDefined } from 'twenty-ui';

const CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX = /{{([^{}]+)}}/g;

export const extractVariableLabel = (rawVariableName: string) => {
  const variableWithoutBrackets = rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => {
      return variableName;
    },
  );

  const parts = variableWithoutBrackets.split('.');
  const displayText = parts.at(-1);

  if (!isDefined(displayText)) {
    throw new Error('Expected to find at least one splitted chunk.');
  }

  return displayText;
};
