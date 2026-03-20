import { type ArgumentNode, valueFromASTUntyped } from 'graphql';
import { isDefined, isEmptyObject } from 'twenty-shared/utils';

// Converts GraphQL AST argument nodes into a plain JS object,
// resolving variable references from the variables map.
export const extractArgumentsFromAst = (
  argumentNodes: readonly ArgumentNode[] | undefined,
  variables: Record<string, unknown> | undefined,
): Record<string, unknown> => {
  if (!argumentNodes || argumentNodes.length === 0) {
    return {};
  }

  const result: Record<string, unknown> = {};

  for (const arg of argumentNodes) {
    const value = valueFromASTUntyped(arg.value, variables);
    if (!isDefined(value) || isEmptyObject(value)) continue;
    result[arg.name.value] = valueFromASTUntyped(arg.value, variables);
  }

  return result;
};
