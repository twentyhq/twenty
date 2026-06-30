import { defineRule } from '@oxlint/plugins';

import { isNodeInsideAncestor } from '../utils/isNodeInsideAncestor';

export const RULE_NAME = 'no-jotai-store-in-selector';

const SELECTOR_FACTORY_NAMES = [
  'createAtomComponentSelector',
  'createAtomComponentFamilySelector',
];

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow using jotaiStore inside component selector get callbacks',
    },
    messages: {
      noJotaiStoreInSelector:
        'Do not use `jotaiStore` inside component selector `get` callbacks. Use the provided `get` helper from the callback argument instead, because it breaks the reactivity loop.',
    },
    schema: [],
  },
  create: (context) => {
    const selectorGetNodes: any[] = [];

    return {
      CallExpression: (node: any) => {
        if (
          node.callee.type !== 'Identifier' ||
          !SELECTOR_FACTORY_NAMES.includes(node.callee.name)
        ) {
          return;
        }

        const configArg = node.arguments[0];

        if (!configArg || configArg.type !== 'ObjectExpression') {
          return;
        }

        const getProperty = configArg.properties.find(
          (prop: any) =>
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'get',
        );

        if (getProperty) {
          selectorGetNodes.push(getProperty.value);
        }
      },
      MemberExpression: (node: any) => {
        if (
          node.object?.type === 'Identifier' &&
          node.object.name === 'jotaiStore'
        ) {
          for (const getNode of selectorGetNodes) {
            if (isNodeInsideAncestor(node, getNode)) {
              context.report({
                node,
                messageId: 'noJotaiStoreInSelector',
              });
              break;
            }
          }
        }
      },
    };
  },
});
