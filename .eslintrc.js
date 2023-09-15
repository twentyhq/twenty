module.exports = {
  // ...existing ESLint configuration
  rules: {
    // ...existing rules
    'no-direct-usehotkeys': {
      create: function(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'useHotkeys'
            ) {
              context.report({
                node,
                message: 'Direct use of useHotkeys is not allowed. Please use useScopedHotkeys instead.',
              });
            }
          },
        };
      },
    },
  },
};
