import { ESLintUtils, type TSESTree } from '@typescript-eslint/utils';
import {
  isIdentifier,
  isVariableDeclarator,
} from '@typescript-eslint/utils/ast-utils';
import { type RuleContext } from '@typescript-eslint/utils/ts-eslint';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-effect-components"
export const RULE_NAME = 'effect-components';

const isPascalCase = (input: string) => !!input.match(/^[A-Z][a-zA-Z0-9_]*/);

type TargetNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

const isReturningEmptyFragmentOrNull = (node: TargetNode) =>
  // Direct return of JSX fragment, e.g., () => <></>
  (node.body.type === 'JSXFragment' && node.body.children.length === 0) ||
  // Direct return of null, e.g., () => null
  (node.body.type === 'Literal' && node.body.value === null) ||
  // Return JSX fragment or null from block
  (node.body.type === 'BlockStatement' &&
    node.body.body.some(
      (statement) =>
        statement.type === 'ReturnStatement' &&
        // Empty JSX fragment return, e.g., return <></>;
        ((statement.argument?.type === 'JSXFragment' &&
          statement.argument.children.length === 0) ||
          // Empty React.Fragment return, e.g., return <React.Fragment></React.Fragment>;
          (statement.argument?.type === 'JSXElement' &&
            statement.argument.openingElement.name.type === 'JSXIdentifier' &&
            statement.argument.openingElement.name.name === 'React.Fragment' &&
            statement.argument.children.length === 0) ||
          // Literal null return, e.g., return null;
          (statement.argument?.type === 'Literal' &&
            statement.argument.value === null)),
    ));

const checkEffectComponent = ({
  context,
  identifier,
  node,
}: {
  context: Readonly<
    RuleContext<'addEffectSuffix' | 'removeEffectSuffix', any[]>
  >;
  identifier: TSESTree.Identifier;
  node: TargetNode;
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
      fix: (fixer) => fixer.replaceText(identifier, componentName + 'Effect'),
    });
    return;
  }

  if (hasEffectSuffix && !isEffectComponent) {
    context.report({
      node,
      messageId: 'removeEffectSuffix',
      data: { componentName },
      fix: (fixer) =>
        fixer.replaceText(identifier, componentName.replace('Effect', '')),
    });
  }
};

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
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
  defaultOptions: [],
  create: (context) => {
    const checkFunctionExpressionEffectComponent = (
      node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
    ) =>
      isVariableDeclarator(node.parent) && isIdentifier(node.parent.id)
        ? checkEffectComponent({ context, identifier: node.parent.id, node })
        : undefined;

    return {
      ArrowFunctionExpression: checkFunctionExpressionEffectComponent,

      FunctionDeclaration: (node) =>
        checkEffectComponent({ context, identifier: node.id, node }),

      FunctionExpression: checkFunctionExpressionEffectComponent,
    };
  },
});
