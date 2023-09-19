"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);
const styledComponentsPrefixedWithStyledRule = createRule({
    create(context) {
        return {
            VariableDeclarator: (node) => {
                const templateExpr = node.init;
                if ((templateExpr === null || templateExpr === void 0 ? void 0 : templateExpr.type) !== utils_1.AST_NODE_TYPES.TaggedTemplateExpression) {
                    return;
                }
                const tag = templateExpr.tag;
                const tagged = tag.type === utils_1.AST_NODE_TYPES.MemberExpression ? tag.object
                    : tag.type === utils_1.AST_NODE_TYPES.CallExpression ? tag.callee
                        : null;
                if ((tagged === null || tagged === void 0 ? void 0 : tagged.type) === utils_1.AST_NODE_TYPES.Identifier && tagged.name === 'styled') {
                    const variable = node.id;
                    if (variable.name.startsWith('Styled')) {
                        return;
                    }
                    context.report({
                        node,
                        messageId: 'noStyledPrefix',
                        data: {
                            componentName: variable.name
                        }
                    });
                }
            },
        };
    },
    name: 'styled-components-prefixed-with-styled',
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Warn when StyledComponents are not prefixed with Styled',
            recommended: "recommended"
        },
        messages: {
            noStyledPrefix: '{{componentName}} is a StyledComponent and is not prefixed with Styled.',
        },
        fixable: 'code',
        schema: [],
    },
    defaultOptions: []
});
module.exports = styledComponentsPrefixedWithStyledRule;
exports.default = styledComponentsPrefixedWithStyledRule;
