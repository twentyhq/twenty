import { ESLintUtils } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-usage-getLoadable-and-getValue-to-get-atoms"
export const RULE_NAME = 'use-getLoadable-and-getValue-to-get-atoms';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure you are using getLoadable and getValue',
      recommended: 'recommended',
    },
    fixable: 'code',
    schema: [],
    messages: {
      redundantAwait: 'Redundant await on non-promise',
      invalidAccessorOnSnapshot:
        "Expected to use method 'getLoadable()' on 'snapshot' but instead found '{{ propertyName }}'",
      invalidWayToGetAtoms:
        "Expected to use method 'getValue()' with 'getLoadable()' but instead found '{{ propertyName }}'",
    },
  },
  defaultOptions: [],
  create: (context) => ({
    AwaitExpression: (node) => {
      const { argument, range }: any = node;
      if (
        (argument.callee?.object?.callee?.object?.name === 'snapshot' &&
          argument?.callee?.object?.callee?.property?.name === 'getLoadable') ||
        (argument.callee?.object?.name === 'snapshot' &&
          argument?.callee?.property?.name === 'getLoadable')
      ) {
        // remove await
        context.report({
          node,
          messageId: 'redundantAwait',
          data: {
            propertyName: argument.callee.property.name,
          },
          fix: (fixer) => fixer.removeRange([range[0], range[0] + 5]),
        });
      }
    },
    MemberExpression: (node) => {
      const { object, property }: any = node;

      if (
        object.callee?.type === 'MemberExpression' &&
        object.callee.object?.name === 'snapshot' &&
        object.callee.property?.name === 'getLoadable'
      ) {
        const propertyName = property.name;

        if (propertyName !== 'getValue') {
          context.report({
            node: property,
            messageId: 'invalidWayToGetAtoms',
            data: {
              propertyName,
            },
            // replace the property with `getValue`
            fix: (fixer) => fixer.replaceText(property, 'getValue'),
          });
        }
      }
    },
    CallExpression: (node) => {
      const { callee }: any = node;

      if (
        callee.type === 'MemberExpression' &&
        callee.object?.name === 'snapshot' &&
        callee.property?.name === 'getPromise'
      ) {
        context.report({
          node: callee.property,
          messageId: 'invalidAccessorOnSnapshot',
          data: {
            propertyName: callee.property.name,
          },
          // Replace `getPromise` with `getLoadable`
          fix: (fixer) => fixer.replaceText(callee.property, 'getLoadable'),
        });
      }
    },
  }),
});
