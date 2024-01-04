"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);
const noHardcodedColorsRule = createRule({
    create: (context) => {
        const testHardcodedColor = (literal) => {
            var _a;
            const colorRegex = /(?:rgba?\()|(?:#[0-9a-fA-F]{2,6})/i;
            if (literal.type === utils_1.TSESTree.AST_NODE_TYPES.Literal &&
                typeof literal.value === "string") {
                if (colorRegex.test(literal.value)) {
                    context.report({
                        node: literal,
                        messageId: "hardcodedColor",
                        data: {
                            color: literal.value,
                        },
                    });
                }
            }
            else if (literal.type === utils_1.TSESTree.AST_NODE_TYPES.TemplateLiteral) {
                const firstStringValue = (_a = literal.quasis[0]) === null || _a === void 0 ? void 0 : _a.value.raw;
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
            description: "Do not use hardcoded RGBA or Hex colors. Please use a color from the theme file.",
        },
        messages: {
            hardcodedColor: "Hardcoded color {{ color }} found. Please use a color from the theme file.",
        },
        type: "suggestion",
        schema: [],
        fixable: "code",
    },
    defaultOptions: [],
});
module.exports = noHardcodedColorsRule;
exports.default = noHardcodedColorsRule;
