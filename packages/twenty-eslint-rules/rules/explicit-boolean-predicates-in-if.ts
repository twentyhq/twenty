import { AST_NODE_TYPES, ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import ts from 'typescript';

export const RULE_NAME = 'explicit-boolean-predicates-in-if';

const isBooleanType = (type: ts.Type) => {
  return type && (type.flags & ts.TypeFlags.BooleanLike) !== 0;
};

// Naming convention prefixes that indicate a boolean value.
// Used as a syntax-only fallback when TypeScript type info is unavailable (oxlint).
const BOOLEAN_NAME_PREFIXES = [
  'is',
  'has',
  'should',
  'can',
  'was',
  'will',
  'did',
  'does',
  'are',
  'had',
];

const looksBooleanByName = (name: string): boolean =>
  BOOLEAN_NAME_PREFIXES.some(
    (prefix) =>
      name.startsWith(prefix) &&
      name.length > prefix.length &&
      name[prefix.length] === name[prefix.length].toUpperCase(),
  );

// Syntax-only approximation when TypeScript type info is unavailable.
// Allows expressions that are either structurally boolean (comparisons, !x)
// or follow the boolean naming convention (isFoo, hasBar, etc.).
// Trade-off: may miss violations on boolean-typed variables with non-boolean
// names (e.g. `loading: boolean`), but avoids false positives on those names.
const isBooleanExpression = (node: TSESTree.Expression): boolean => {
  switch (node.type) {
    case AST_NODE_TYPES.BinaryExpression:
      // x === y, x !== y, x > y — comparison operators always produce boolean
      return true;

    case AST_NODE_TYPES.UnaryExpression:
      // !x always produces boolean; typeof/void/+/- do not
      return (node as TSESTree.UnaryExpression).operator === '!';

    case AST_NODE_TYPES.LogicalExpression:
      // a && b, a || b — commonly used to combine boolean conditions
      return true;

    case AST_NODE_TYPES.Literal:
      return typeof (node as TSESTree.Literal).value === 'boolean';

    case AST_NODE_TYPES.Identifier:
      // isEnabled, hasPermission — trust the naming convention
      return looksBooleanByName((node as TSESTree.Identifier).name);

    case AST_NODE_TYPES.CallExpression: {
      const { callee } = node as TSESTree.CallExpression;
      if (callee.type === AST_NODE_TYPES.Identifier) {
        // isDefined(x), hasPermission()
        return looksBooleanByName((callee as TSESTree.Identifier).name);
      }
      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        const { property } = callee as TSESTree.MemberExpression;
        if (property.type === AST_NODE_TYPES.Identifier) {
          // user.isActive(), record.hasField()
          return looksBooleanByName((property as TSESTree.Identifier).name);
        }
      }
      return false;
    }

    case AST_NODE_TYPES.MemberExpression: {
      const { property } = node as TSESTree.MemberExpression;
      if (property.type === AST_NODE_TYPES.Identifier) {
        // user.isActive, record.hasField
        return looksBooleanByName((property as TSESTree.Identifier).name);
      }
      return false;
    }

    default:
      return false;
  }
};

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce explicit boolean predicates in if statements',
    },
    fixable: 'code',
    schema: [],
    messages: {
      nonExplicitPredicate:
        'Use an explicit boolean predicate in if statements.',
    },
  },
  defaultOptions: [],
  create: (context) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const services = ESLintUtils.getParserServices(context, true) as any;
    const typeChecker = services?.program?.getTypeChecker?.() ?? null;

    return {
      IfStatement: (node: TSESTree.IfStatement) => {
        const { test } = node;

        if (typeChecker !== null) {
          // Type-aware path: ESLint with TypeScript project configured.
          // Full precision — uses the actual TypeScript type of the expression.
          const tsNode = services.esTreeNodeToTSNodeMap.get(test);
          const type = typeChecker.getTypeAtLocation(tsNode);

          if (!isBooleanType(type)) {
            context.report({ node: test, messageId: 'nonExplicitPredicate' });
          }
        } else {
          // Syntax-only path: oxlint (or ESLint without project config).
          // Uses AST structure and naming conventions as a proxy for type info.
          if (!isBooleanExpression(test)) {
            context.report({ node: test, messageId: 'nonExplicitPredicate' });
          }
        }
      },
    };
  },
});

export default rule;
