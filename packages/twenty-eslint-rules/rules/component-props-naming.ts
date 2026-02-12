import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import {
  isIdentifier,
  isVariableDeclarator,
} from '@typescript-eslint/utils/ast-utils';
import { type RuleContext } from '@typescript-eslint/utils/ts-eslint';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-component-props-naming"
export const RULE_NAME = 'component-props-naming';

const checkPropsTypeName = ({
  node,
  context,
  functionName,
}: {
  node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression;
  context: Readonly<RuleContext<'invalidPropsTypeName', any[]>>;
  functionName: string;
}) => {
  const expectedPropTypeName = `${functionName}Props`;

  if (!functionName.match(/^[A-Z]/)) return;

  node.params.forEach((param) => {
    if (
      (param.type === TSESTree.AST_NODE_TYPES.ObjectPattern ||
        isIdentifier(param)) &&
      param.typeAnnotation?.typeAnnotation.type ===
        TSESTree.AST_NODE_TYPES.TSTypeReference &&
      isIdentifier(param.typeAnnotation?.typeAnnotation.typeName)
    ) {
      const { typeName } = param.typeAnnotation.typeAnnotation;
      const actualPropTypeName = typeName.name;
      if (actualPropTypeName !== expectedPropTypeName) {
        context.report({
          node: param,
          messageId: 'invalidPropsTypeName',
          data: { expectedPropTypeName, actualPropTypeName },
          fix: (fixer) => fixer.replaceText(typeName, expectedPropTypeName),
        });
      }
    }
  });
};

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure component props follow naming convention',
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalidPropsTypeName:
        "Expected prop type to be '{{ expectedPropTypeName }}' but found '{{ actualPropTypeName }}'",
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ArrowFunctionExpression: (node) => {
        if (isVariableDeclarator(node.parent) && isIdentifier(node.parent.id)) {
          checkPropsTypeName({
            node,
            context,
            functionName: node.parent.id.name,
          });
        }
      },
      FunctionDeclaration: (node) => {
        checkPropsTypeName({ node, context, functionName: node.id.name });
      },
    };
  },
});
