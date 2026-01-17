import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import ts from 'typescript';

export const RULE_NAME = 'explicit-boolean-predicates-in-if';

const isBooleanType = (type: ts.Type) => {
  // check if boolean flag(s) is set on the type (e.g. boolean, true, false, etc.)
  return type && (type.flags & ts.TypeFlags.BooleanLike) !== 0;
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
    const services = ESLintUtils.getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    return {
      IfStatement: (node: TSESTree.IfStatement) => {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.test);
        const type = typeChecker.getTypeAtLocation(tsNode);

        if (!isBooleanType(type)) {
          const { test } = node;
          context.report({
            node: test,
            messageId: 'nonExplicitPredicate',
          });
        }
      },
    };
  },
});

export default rule;
