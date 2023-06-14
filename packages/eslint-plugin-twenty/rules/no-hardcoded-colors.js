module.exports = {
  create: function (context) {
    return {
      TaggedTemplateExpression(node) {
        if (context.getFilename().endsWith('themes.ts')) {
          return;
        }

        node.quasi.quasis.forEach((quasi) => {
          const colorRegex =
            /(?:rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*\d+\.?\d*)?\))|(?:#[0-9a-fA-F]{6})/i;

          if (colorRegex.test(quasi.value.raw)) {
            context.report({
              node,
              message:
                'Do not use hardcoded RGBA or Hex colors. Please use a color from the theme file.',
            });
          }
        });
      },
    };
  },
};
