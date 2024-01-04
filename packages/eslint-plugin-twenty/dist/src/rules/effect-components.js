"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);
const checkIsPascalCase = (input) => {
    const pascalCaseRegex = /^[A-Z][a-zA-Z0-9_]*/g;
    return pascalCaseRegex.test(input);
};
const effectComponentsRule = createRule({
    create: (context) => {
        const checkThatNodeIsEffectComponent = (node) => {
            let componentName = "";
            let identifierNode = node.id;
            const isIdentifier = (node) => (node === null || node === void 0 ? void 0 : node.type) === utils_1.TSESTree.AST_NODE_TYPES.Identifier;
            const isVariableDeclarator = (node) => node.type === utils_1.TSESTree.AST_NODE_TYPES.VariableDeclarator;
            const isArrowFunction = (node) => node.type === utils_1.TSESTree.AST_NODE_TYPES.ArrowFunctionExpression;
            const isFunctionDeclaration = (node) => node.type === utils_1.TSESTree.AST_NODE_TYPES.FunctionDeclaration;
            const isFunctionExpression = (node) => node.type === utils_1.TSESTree.AST_NODE_TYPES.FunctionExpression;
            if (isArrowFunction(node) &&
                isVariableDeclarator(node.parent) &&
                isIdentifier(node.parent.id)) {
                componentName = node.parent.id.name;
                identifierNode = node.parent.id;
            }
            else if (isFunctionDeclaration(node) && isIdentifier(node.id)) {
                componentName = node.id.name;
                identifierNode = node.id;
            }
            else if (isFunctionExpression(node) &&
                isVariableDeclarator(node.parent) &&
                isIdentifier(node.parent.id)) {
                componentName = node.parent.id.name;
                identifierNode = node.parent.id;
            }
            if (!checkIsPascalCase(componentName)) {
                return;
            }
            const isReturningEmptyFragmentOrNull = 
            // Direct return of JSX fragment, e.g., () => <></>
            (node.body.type === "JSXFragment" && node.body.children.length === 0) ||
                // Direct return of null, e.g., () => null
                (node.body.type === "Literal" && node.body.value === null) ||
                // Return JSX fragment or null from block
                (node.body.type === "BlockStatement" &&
                    node.body.body.some((statement) => {
                        var _a, _b, _c;
                        return statement.type === "ReturnStatement" &&
                            // Empty JSX fragment return, e.g., return <></>;
                            ((((_a = statement.argument) === null || _a === void 0 ? void 0 : _a.type) === "JSXFragment" &&
                                statement.argument.children.length === 0) ||
                                // Empty React.Fragment return, e.g., return <React.Fragment></React.Fragment>;
                                (((_b = statement.argument) === null || _b === void 0 ? void 0 : _b.type) === "JSXElement" &&
                                    statement.argument.openingElement.name.type ===
                                        "JSXIdentifier" &&
                                    statement.argument.openingElement.name.name ===
                                        "React.Fragment" &&
                                    statement.argument.children.length === 0) ||
                                // Literal null return, e.g., return null;
                                (((_c = statement.argument) === null || _c === void 0 ? void 0 : _c.type) === "Literal" &&
                                    statement.argument.value === null));
                    }));
            const hasEffectSuffix = componentName.endsWith("Effect");
            const hasEffectSuffixButIsNotEffectComponent = hasEffectSuffix && !isReturningEmptyFragmentOrNull;
            const isEffectComponentButDoesNotHaveEffectSuffix = !hasEffectSuffix && isReturningEmptyFragmentOrNull;
            if (isEffectComponentButDoesNotHaveEffectSuffix) {
                context.report({
                    node,
                    messageId: "effectSuffix",
                    data: {
                        componentName: componentName,
                    },
                    fix: (fixer) => {
                        if (isArrowFunction(node))
                            if (identifierNode) {
                                return fixer.replaceText(identifierNode, componentName + "Effect");
                            }
                        return null;
                    },
                });
            }
            else if (hasEffectSuffixButIsNotEffectComponent) {
                context.report({
                    node,
                    messageId: "noEffectSuffix",
                    data: {
                        componentName: componentName,
                    },
                    fix: (fixer) => {
                        if (identifierNode) {
                            return fixer.replaceText(identifierNode, componentName.replace("Effect", ""));
                        }
                        return null;
                    },
                });
            }
        };
        return {
            ArrowFunctionExpression: checkThatNodeIsEffectComponent,
            FunctionDeclaration: checkThatNodeIsEffectComponent,
            FunctionExpression: checkThatNodeIsEffectComponent,
        };
    },
    name: "effect-components",
    meta: {
        docs: {
            description: "Effect components should end with the Effect suffix. This rule checks only components that are in PascalCase and that return a JSX fragment or null. Any renderProps or camelCase components are ignored.",
        },
        messages: {
            effectSuffix: "Effect component {{ componentName }} should end with the Effect suffix.",
            noEffectSuffix: "Component {{ componentName }} shouldn't end with the Effect suffix because it doesn't return a JSX fragment or null.",
        },
        type: "suggestion",
        schema: [],
        fixable: "code",
    },
    defaultOptions: [],
});
module.exports = effectComponentsRule;
exports.default = effectComponentsRule;
