import { TSESTree, ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);

const noHardcodedColorsRule = createRule({
  create(context) {
    return {
      TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression) {
        if (context.getFilename().endsWith("themes.ts")) {
          return;
        }

        node.quasi.quasis.forEach((quasi) => {
          const colorRegex =
            /(?:rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*\d+\.?\d*)?\))|(?:#[0-9a-fA-F]{6})/i;

          if (colorRegex.test(quasi.value.raw)) {
            context.report({
              node,
              messageId: "avoidHardcodedColors",
              data: {
                color: quasi.value.raw,
              },
            });
          }
        });
      },
    };
  },
  name: "avoid-hardcoded-colors",
  meta: {
    type: "suggestion",
    docs: {
      description: "Avoid hardcoded RGBA or Hex colors, use colors from the theme file.",
      recommended: "recommended",
    },
    schema: [],
    fixable: "code",
    messages: {
      avoidHardcodedColors:
        "Do not use hardcoded RGBA or Hex colors. Please use a color from the theme file.",
    },
  },
  defaultOptions: []
});

module.exports = noHardcodedColorsRule;

export default noHardcodedColorsRule;