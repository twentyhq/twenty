import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/ts-eslint";

const createRule = ESLintUtils.RuleCreator(
  () => "https://docs.twenty.com/developer/frontend/style-guide#props",
);

const checkPropsTypeName = (
  node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression,
  context: Readonly<RuleContext<"invalidPropsTypeName", never[]>>,
  functionName: string,
) => {
  const expectedPropTypeName = `${functionName}Props`;

  if (/^[A-Z]/.test(functionName)) {
    node.params.forEach((param) => {
      if (
        (param.type === AST_NODE_TYPES.ObjectPattern ||
          param.type === AST_NODE_TYPES.Identifier) &&
        param.typeAnnotation?.typeAnnotation?.type ===
          AST_NODE_TYPES.TSTypeReference &&
        param.typeAnnotation.typeAnnotation.typeName.type ===
          AST_NODE_TYPES.Identifier
      ) {
        const { typeName } = param.typeAnnotation.typeAnnotation;
        const actualPropTypeName = typeName.name;
        if (actualPropTypeName !== expectedPropTypeName) {
          context.report({
            node: param,
            messageId: "invalidPropsTypeName",
            data: { expectedPropTypeName, actualPropTypeName },
            fix: (fixer) => fixer.replaceText(typeName, expectedPropTypeName),
          });
        }
      }
    });
  }
};

const componentPropsNamingRule = createRule({
  create: (context) => {
    return {
      ArrowFunctionExpression: (node) => {
        if (
          node.parent.type === AST_NODE_TYPES.VariableDeclarator &&
          node.parent.id.type === AST_NODE_TYPES.Identifier
        ) {
          const functionName = node.parent?.id?.name;

          checkPropsTypeName(node, context, functionName);
        }
      },
      FunctionDeclaration: (node) => {
        if (node.id?.name) {
          const functionName = node.id.name;

          checkPropsTypeName(node, context, functionName);
        }
      },
    };
  },
  name: "component-props-naming",
  meta: {
    type: "problem",
    docs: {
      description: "Ensure component props follow naming convention",
      recommended: "recommended",
    },
    fixable: "code",
    schema: [],
    messages: {
      invalidPropsTypeName:
        "Expected prop type to be '{{ expectedPropTypeName }}' but found '{{ actualPropTypeName }}'",
    },
  },
  defaultOptions: [],
});

module.exports = componentPropsNamingRule;
export default componentPropsNamingRule;
