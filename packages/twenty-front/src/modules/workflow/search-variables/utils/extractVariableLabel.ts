export const extractVariableLabel = (rawVariable: string) => {
  const variableWithoutBrackets = rawVariable.replace(
    /\{\{([^{}]+)\}\}/g,
    (_, variable) => {
      return variable;
    },
  );

  const parts = variableWithoutBrackets.split('.');
  const displayText = parts.at(-1);

  return displayText;
};
