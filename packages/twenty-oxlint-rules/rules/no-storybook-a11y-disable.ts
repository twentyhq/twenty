import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-storybook-a11y-disable';

const DISABLING_TEST_VALUES = ['off', 'todo'];

const getPropertyKeyName = (node: any): string | undefined => {
  if (node.type !== 'Property') {
    return undefined;
  }

  if (node.key.type === 'Identifier') {
    return node.key.name;
  }

  if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
    return node.key.value;
  }

  return undefined;
};

const isDisablingTestProperty = (node: any): boolean =>
  node.type === 'Property' &&
  getPropertyKeyName(node) === 'test' &&
  node.value.type === 'Literal' &&
  DISABLING_TEST_VALUES.includes(node.value.value);

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        "Disallow disabling the Storybook accessibility (axe) gate with a11y: { test: 'off' | 'todo' }.",
    },
    messages: {
      noA11yDisable:
        "Do not disable the accessibility gate with test: 'off' or test: 'todo'. Fix the axe violations, or defer only color-contrast via A11Y_DEFER_COLOR_CONTRAST.",
    },
    schema: [],
  },
  create: (context) => ({
    Property: (node: any) => {
      if (getPropertyKeyName(node) !== 'a11y') {
        return;
      }

      if (node.value.type !== 'ObjectExpression') {
        return;
      }

      const disablingProperty = node.value.properties.find(
        isDisablingTestProperty,
      );

      if (disablingProperty !== undefined) {
        context.report({
          node: disablingProperty,
          messageId: 'noA11yDisable',
        });
      }
    },
  }),
});
