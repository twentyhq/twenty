import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'effect-components';

const isPascalCase = (input: string) => !!input.match(/^[A-Z][a-zA-Z0-9_]*/);

const isReturningEmptyFragmentOrNull = (node: any) =>
  (node.body.type === 'JSXFragment' && node.body.children.length === 0) ||
  (node.body.type === 'Literal' && node.body.value === null) ||
  (node.body.type === 'BlockStatement' &&
    node.body.body.some(
      (statement: any) =>
        statement.type === 'ReturnStatement' &&
        ((statement.argument?.type === 'JSXFragment' &&
          statement.argument.children.length === 0) ||
          (statement.argument?.type === 'JSXElement' &&
            statement.argument.openingElement.name.type ===
              'JSXIdentifier' &&
            statement.argument.openingElement.name.name ===
              'React.Fragment' &&
            statement.argument.children.length === 0) ||
          (statement.argument?.type === 'Literal' &&
            statement.argument.value === null)),
    ));

const checkEffectComponent = ({
  context,
  identifier,
  node,
}: {
  context: any;
  identifier: any;
  node: any;
}) => {
  const componentName = identifier.name;

  if (!isPascalCase(componentName)) return;

  const isEffectComponent = isReturningEmptyFragmentOrNull(node);
  const hasEffectSuffix = componentName.endsWith('Effect');

  if (isEffectComponent && !hasEffectSuffix) {
    context.report({
      node,
      messageId: 'addEffectSuffix',
      data: { componentName },
      fix: (fixer: any) =>
        fixer.replaceText(identifier, componentName + 'Effect'),
    });
    return;
  }

  if (hasEffectSuffix && !isEffectComponent) {
    context.report({
      node,
      messageId: 'removeEffectSuffix',
      data: { componentName },
      fix: (fixer: any) =>
        fixer.replaceText(identifier, componentName.replace('Effect', '')),
    });
  }
};

export const rule = defineRule({
  meta: {
    docs: {
      description:
        'Effect components should end with the Effect suffix. This rule checks only components that are in PascalCase and that return a JSX fragment or null. Any renderProps or camelCase components are ignored.',
    },
    messages: {
      addEffectSuffix:
        'Effect component {{ componentName }} should end with the Effect suffix.',
      removeEffectSuffix:
        "Component {{ componentName }} shouldn't end with the Effect suffix because it doesn't return a JSX fragment or null.",
    },
    type: 'suggestion',
    schema: [],
    fixable: 'code',
  },
  create: (context) => {
    const checkFunctionExpressionEffectComponent = (node: any) =>
      node.parent?.type === 'VariableDeclarator' &&
      node.parent.id?.type === 'Identifier'
        ? checkEffectComponent({
            context,
            identifier: node.parent.id,
            node,
          })
        : undefined;

    return {
      ArrowFunctionExpression: checkFunctionExpressionEffectComponent,

      FunctionDeclaration: (node: any) =>
        checkEffectComponent({ context, identifier: node.id, node }),

      FunctionExpression: checkFunctionExpressionEffectComponent,
    };
  },
});
