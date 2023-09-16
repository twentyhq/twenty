import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);

const isHardcodedColors = (input:  string): boolean => {
    const colorRegex =
    /(?:rgba?\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})(,\s*\d+\.?\d*)?\))|(?:#[0-9a-fA-F]{6})/i;

    return colorRegex.test(input);
}

const noHardcodedColorsRule = createRule({
    name: "no-hardcoded-colors",
    meta: {
      docs: {
        description:
          "Do not use hardcoded RGBA or Hex colors",
      },
      messages: {
        noHardcodedColors: "Do not use hardcoded RGBA or Hex colors. Please use a color from the theme file.",
      },
      type: "suggestion",
      schema: [],
      fixable: "code",
    },
    defaultOptions: [],
    create: (context) => {
        return {
            TaggedTemplateExpression: (node) => {
                if (context.getFilename().endsWith("themes.ts")) {
                    return;
                }

                node.quasi.quasis.forEach((quasi) => {
                    if (isHardcodedColors(quasi.value.raw)) {
                        context.report({
                            node,
                            messageId: "noHardcodedColors",
                        })
                    }
                });
            }
        }
    }
  
});
  
export default noHardcodedColorsRule;