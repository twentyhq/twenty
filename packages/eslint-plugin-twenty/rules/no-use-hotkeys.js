module.exports = {
  rules: {
    'no-hardcoded-colors': require('./rules/no-hardcoded-colors'),
    'styled-components-prefixed-with-styled': require('./rules/styled-components-prefixed-with-styled'),
    'matching-state-variable': require('./rules/matching-state-variable'),
    'no-use-hotkeys': require('./rules/no-use-hotkeys'),
  },
};
    },
    messages: {
      noUseHotkeys:
        'Direct use of useHotkeys is not allowed. Please use useScopedHotkeys instead.',
    },
  },
  create: function (context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'useHotkeys'
        ) {
          context.report({
            node,
            messageId: 'noUseHotkeys',
          });
        }
      },
    };
  },
};
