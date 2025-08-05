export const substituteWorkflowVariables = (
  value: any,
  variableValues: { [variablePath: string]: any },
): any => {
  if (typeof value === 'string') {
    return value.replace(/{{([^}]+)}}/g, (match, variablePath) => {
      const trimmedPath = variablePath.trim();
      return variableValues[trimmedPath] ?? match;
    });
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      substituteWorkflowVariables(item, variableValues),
    );
  }

  if (typeof value === 'object' && value !== null) {
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = substituteWorkflowVariables(val, variableValues);
    }
    return result;
  }

  return value;
};
