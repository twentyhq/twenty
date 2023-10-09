"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => "https://docs.twenty.com/developer/frontend/style-guide#props");
const checkPropsTypeName = (node, context, functionName) => {
    const expectedPropTypeName = `${functionName}Props`;
    if (/^[A-Z]/.test(functionName)) {
        node.params.forEach((param) => {
            var _a, _b;
            if ((param.type === utils_1.AST_NODE_TYPES.ObjectPattern ||
                param.type === utils_1.AST_NODE_TYPES.Identifier) &&
                ((_b = (_a = param.typeAnnotation) === null || _a === void 0 ? void 0 : _a.typeAnnotation) === null || _b === void 0 ? void 0 : _b.type) ===
                    utils_1.AST_NODE_TYPES.TSTypeReference &&
                param.typeAnnotation.typeAnnotation.typeName.type ===
                    utils_1.AST_NODE_TYPES.Identifier) {
                const { typeName } = param.typeAnnotation.typeAnnotation;
                const actualPropTypeName = typeName.name;
                if (actualPropTypeName !== expectedPropTypeName) {
                    context.report({
                        node: param,
                        messageId: "invalidPropsTypeName",
                        data: { expectedPropTypeName, actualPropTypeName },
                        fix: (fixer) => fixer.replaceText(typeName, expectedPropTypeName),
                    });
                }
            }
        });
    }
};
const componentPropsNamingRule = createRule({
    create: (context) => {
        return {
            ArrowFunctionExpression: (node) => {
                var _a, _b;
                if (node.parent.type === utils_1.AST_NODE_TYPES.VariableDeclarator &&
                    node.parent.id.type === utils_1.AST_NODE_TYPES.Identifier) {
                    const functionName = (_b = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.name;
                    checkPropsTypeName(node, context, functionName);
                }
            },
            FunctionDeclaration: (node) => {
                var _a;
                if ((_a = node.id) === null || _a === void 0 ? void 0 : _a.name) {
                    const functionName = node.id.name;
                    checkPropsTypeName(node, context, functionName);
                }
            },
        };
    },
    name: "component-props-naming",
    meta: {
        type: "problem",
        docs: {
            description: "Ensure component props follow naming convention",
            recommended: "recommended",
        },
        fixable: "code",
        schema: [],
        messages: {
            invalidPropsTypeName: "Expected prop type to be '{{ expectedPropTypeName }}' but found '{{ actualPropTypeName }}'",
        },
    },
    defaultOptions: [],
});
module.exports = componentPropsNamingRule;
exports.default = componentPropsNamingRule;
