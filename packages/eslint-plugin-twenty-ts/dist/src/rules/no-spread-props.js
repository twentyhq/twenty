"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://docs.twenty.com/developer/frontend/style-guide#no-single-variable-prop-spreading-in-jsx-elements");
const noSpreadPropsRule = createRule({
    create: (context) => ({
        JSXSpreadAttribute: (node) => {
            if (node.argument.type === "Identifier") {
                context.report({
                    node,
                    messageId: "noSpreadProps",
                });
            }
        },
    }),
    name: "no-spread-props",
    meta: {
        docs: {
            description: "Disallow passing props as {...props} in React components.",
        },
        messages: {
            noSpreadProps: `Single variable prop spreading is disallowed in JSX elements.\nPrefer explicitly listing out all props or using an object expression like so: \`{...{ prop1, prop2 }}\`.\nSee https://docs.twenty.com/developer/frontend/style-guide#no-single-variable-prop-spreading-in-jsx-elements for more information.`,
        },
        type: "suggestion",
        schema: [],
        fixable: "code",
    },
    defaultOptions: [],
});
module.exports = noSpreadPropsRule;
exports.default = noSpreadPropsRule;
