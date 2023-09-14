module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'disallow the use of useHotkeys hook from react-hotkeys-hook library',
      category: 'Best Practices',
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
