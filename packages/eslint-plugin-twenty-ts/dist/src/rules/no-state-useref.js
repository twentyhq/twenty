"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);
const noStateUseRef = createRule({
    create: (context) => {
        return {
            CallExpression: (node) => {
                var _a;
                if (node.callee.type === "Identifier" &&
                    node.callee.name === "useRef" &&
                    (!node.typeParameters ||
                        (((_a = node.typeParameters.params) === null || _a === void 0 ? void 0 : _a.length) &&
                            node.typeParameters.params[0].type === "TSTypeReference" &&
                            node.typeParameters.params[0].typeName.type === "Identifier" &&
                            !node.typeParameters.params[0].typeName.name.match(/^(HTML.*Element|Element)$/)))) {
                    context.report({
                        node,
                        messageId: "noStateUseRef",
                    });
                }
            },
        };
    },
    name: "no-state-useref",
    meta: {
        docs: {
            description: "Don't use useRef for state management",
        },
        messages: {
            noStateUseRef: "Don't use useRef for state management. See https://docs.twenty.com/developer/frontend/best-practices#do-not-use-useref-to-store-state for more details.",
        },
        type: "suggestion",
        schema: [],
    },
    defaultOptions: [],
});
module.exports = noStateUseRef;
exports.default = noStateUseRef;
