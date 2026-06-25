import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'component-props-naming';

const checkPropsTypeName = ({
  node,
  context,
  functionName,
}: {
  node: any;
  context: any;
  functionName: string;
}) => {
  const expectedPropTypeName = `${functionName}Props`;

  if (!functionName.match(/^[A-Z]/)) return;

  node.params.forEach((param: any) => {
    if (
      (param.type === 'ObjectPattern' || param?.type === 'Identifier') &&
      param.typeAnnotation?.typeAnnotation.type === 'TSTypeReference' &&
      param.typeAnnotation?.typeAnnotation.typeName?.type === 'Identifier'
    ) {
      const { typeName } = param.typeAnnotation.typeAnnotation;
      const actualPropTypeName = typeName.name;
      if (actualPropTypeName !== expectedPropTypeName) {
        context.report({
          node: param,
          messageId: 'invalidPropsTypeName',
          data: { expectedPropTypeName, actualPropTypeName },
          fix: (fixer: any) =>
            fixer.replaceText(typeName, expectedPropTypeName),
        });
      }
    }
  });
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure component props follow naming convention',
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalidPropsTypeName:
        "Expected prop type to be '{{ expectedPropTypeName }}' but found '{{ actualPropTypeName }}'",
    },
  },
  create: (context) => {
    return {
      ArrowFunctionExpression: (node: any) => {
        if (
          node.parent?.type === 'VariableDeclarator' &&
          node.parent.id?.type === 'Identifier'
        ) {
          checkPropsTypeName({
            node,
            context,
            functionName: node.parent.id.name,
          });
        }
      },
      FunctionDeclaration: (node: any) => {
        checkPropsTypeName({ node, context, functionName: node.id.name });
      },
    };
  },
});
