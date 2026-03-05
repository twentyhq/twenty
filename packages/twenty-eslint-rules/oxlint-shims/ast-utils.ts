// Shim for @typescript-eslint/utils/ast-utils.

import type { TSESTree } from '@typescript-eslint/utils';

type Node = TSESTree.Node | null | undefined;

export const isIdentifier = (node: Node): node is TSESTree.Identifier =>
  node?.type === 'Identifier';

export const isVariableDeclarator = (
  node: Node,
): node is TSESTree.VariableDeclarator => node?.type === 'VariableDeclarator';

export const isFunction = (
  node: Node,
): node is
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression
  | TSESTree.ArrowFunctionExpression =>
  node?.type === 'FunctionDeclaration' ||
  node?.type === 'FunctionExpression' ||
  node?.type === 'ArrowFunctionExpression';
