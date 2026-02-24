import { type VariableDeclaration } from 'ts-morph';

import { type JsonLogicRule } from '../types/json-logic-rule';

export const handleLocalVariableDeclaration = (
  variableDeclaration: VariableDeclaration,
  _localVariablesMap: Map<string, JsonLogicRule>,
): void => {
  void _localVariablesMap;
  void variableDeclaration;
};
