import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';

import { isNodeInsideAncestor } from '../utils/isNodeInsideAncestor';

export const RULE_NAME = 'no-direct-atom-family-in-selector';

const SELECTOR_FACTORY_NAMES = [
  'createAtomComponentSelector',
  'createAtomComponentFamilySelector',
];

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
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
  defaultOptions: [],
  create: (context) => {
    const selectorGetNodes: TSESTree.Node[] = [];

    return {
      CallExpression: (node) => {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          !SELECTOR_FACTORY_NAMES.includes(node.callee.name)
        ) {
          return;
        }

        const configArg = node.arguments[0];

        if (
          !configArg ||
          configArg.type !== AST_NODE_TYPES.ObjectExpression
        ) {
          return;
        }

        const getProperty = configArg.properties.find(
          (prop): prop is TSESTree.Property =>
            prop.type === AST_NODE_TYPES.Property &&
            prop.key.type === AST_NODE_TYPES.Identifier &&
            prop.key.name === 'get',
        );

        if (getProperty) {
          selectorGetNodes.push(getProperty.value);
        }
      },

      'CallExpression > MemberExpression[property.name=/^(atomFamily|selectorFamily)$/]':
        (node: TSESTree.MemberExpression) => {
          for (const getNode of selectorGetNodes) {
            if (isNodeInsideAncestor(node, getNode)) {
              context.report({
                node,
                messageId: 'noDirectAtomFamilyInSelector',
              });
              break;
            }
          }
        },
    };
  },
});
