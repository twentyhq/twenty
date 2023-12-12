import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);

const noHardcodedColorsRule = createRule({
  create: (context) => {
    const testHardcodedColor = (
      literal: TSESTree.Literal | TSESTree.TemplateLiteral,
    ) => {
      const colorRegex = /(?:rgba?\()|(?:#[0-9a-fA-F]{2,6})/i;

      if (
        literal.type === TSESTree.AST_NODE_TYPES.Literal &&
        typeof literal.value === "string"
      ) {
        if (colorRegex.test(literal.value)) {
          context.report({
            node: literal,
            messageId: "hardcodedColor",
            data: {
              color: literal.value,
            },
          });
        }
      } else if (literal.type === TSESTree.AST_NODE_TYPES.TemplateLiteral) {
        const firstStringValue = literal.quasis[0]?.value.raw;

        if (colorRegex.test(firstStringValue)) {
          context.report({
            node: literal,
            messageId: "hardcodedColor",
            data: {
              color: firstStringValue,
            },
          });
        }
      }
    };

    return {
      Literal: testHardcodedColor,
      TemplateLiteral: testHardcodedColor,
    };
  },
  name: "no-hardcoded-colors",
  meta: {
    docs: {
      description:
        "Do not use hardcoded RGBA or Hex colors. Please use a color from the theme file.",
    },
    messages: {
      hardcodedColor:
        "Hardcoded color {{ color }} found. Please use a color from the theme file.",
    },
    type: "suggestion",
    schema: [],
    fixable: "code",
  },
  defaultOptions: [],
});

module.exports = noHardcodedColorsRule;

export default noHardcodedColorsRule;
