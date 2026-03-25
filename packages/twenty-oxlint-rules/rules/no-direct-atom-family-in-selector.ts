import { defineRule } from '@oxlint/plugins';

import { isNodeInsideAncestor } from '../utils/isNodeInsideAncestor';

export const RULE_NAME = 'no-direct-atom-family-in-selector';

const SELECTOR_FACTORY_NAMES = [
  'createAtomComponentSelector',
  'createAtomComponentFamilySelector',
];

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct .atomFamily() or .selectorFamily() calls inside component selector get callbacks',
    },
    messages: {
      noDirectAtomFamilyInSelector:
        'Do not call `.atomFamily()` or `.selectorFamily()` directly inside component selector `get` callbacks. Use the provided `get` helper instead, because it is the cleanest API.',
    },
    schema: [],
  },
  create: (context) => {
    const selectorGetNodes: any[] = [];

    return {
      CallExpression: (node: any) => {
        if (
          node.callee.type === 'Identifier' &&
          SELECTOR_FACTORY_NAMES.includes(node.callee.name)
        ) {
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
          return;
        }

        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property?.type === 'Identifier' &&
          /^(atomFamily|selectorFamily)$/.test(node.callee.property.name)
        ) {
          for (const getNode of selectorGetNodes) {
            if (isNodeInsideAncestor(node.callee, getNode)) {
              context.report({
                node: node.callee,
                messageId: 'noDirectAtomFamilyInSelector',
              });
              break;
            }
          }
        }
      },
    };
  },
});
