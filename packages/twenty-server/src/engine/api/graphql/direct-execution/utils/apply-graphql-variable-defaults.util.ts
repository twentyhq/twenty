import { type OperationDefinitionNode, valueFromASTUntyped } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

// Direct execution skips graphql-js variable coercion, which is where omitted variables get their defaults
export const applyGraphqlVariableDefaults = (
  operation: OperationDefinitionNode | undefined,
  variables: Record<string, unknown>,
): Record<string, unknown> => {
  const variablesWithDefaults = { ...variables };

  for (const variableDefinition of operation?.variableDefinitions ?? []) {
    const variableName = variableDefinition.variable.name.value;

    if (
      isDefined(variableDefinition.defaultValue) &&
      variablesWithDefaults[variableName] === undefined
    ) {
      variablesWithDefaults[variableName] = valueFromASTUntyped(
        variableDefinition.defaultValue,
      );
    }
  }

  return variablesWithDefaults;
};
