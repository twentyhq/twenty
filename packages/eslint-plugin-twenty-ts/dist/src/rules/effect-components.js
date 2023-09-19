"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);
const checkIsPascalCase = (input) => {
    const pascalCaseRegex = /^(?:\p{Uppercase_Letter}\p{Letter}*)+$/u;
    return pascalCaseRegex.test(input);
};
const effectComponentsRule = createRule({
    create(context) {
        const checkThatNodeIsEffectComponent = (node) => {
            var _a, _b, _c, _d, _e;
            const isPascalCase = checkIsPascalCase((_b = (_a = node.id) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "");
            if (!isPascalCase) {
                return;
            }
            const isReturningFragmentOrNull = (
            // Direct return of JSX fragment, e.g., () => <></>
            (node.body.type === 'JSXFragment' && node.body.children.length === 0) ||
                // Direct return of null, e.g., () => null
                (node.body.type === 'Literal' && node.body.value === null) ||
                // Return JSX fragment or null from block
                (node.body.type === 'BlockStatement' &&
                    node.body.body.some(statement => {
                        var _a, _b, _c;
                        return statement.type === 'ReturnStatement' &&
                            (
                            // Empty JSX fragment return, e.g., return <></>;
                            (((_a = statement.argument) === null || _a === void 0 ? void 0 : _a.type) === 'JSXFragment' && statement.argument.children.length === 0) ||
                                // Empty React.Fragment return, e.g., return <React.Fragment></React.Fragment>;
                                (((_b = statement.argument) === null || _b === void 0 ? void 0 : _b.type) === 'JSXElement' &&
                                    statement.argument.openingElement.name.type === 'JSXIdentifier' &&
                                    statement.argument.openingElement.name.name === 'React.Fragment' &&
                                    statement.argument.children.length === 0) ||
                                // Literal null return, e.g., return null;
                                (((_c = statement.argument) === null || _c === void 0 ? void 0 : _c.type) === 'Literal' && statement.argument.value === null));
                    })));
            const hasEffectSuffix = (_c = node.id) === null || _c === void 0 ? void 0 : _c.name.endsWith("Effect");
            const hasEffectSuffixButIsNotEffectComponent = hasEffectSuffix && !isReturningFragmentOrNull;
            const isEffectComponentButDoesNotHaveEffectSuffix = !hasEffectSuffix && isReturningFragmentOrNull;
            if (isEffectComponentButDoesNotHaveEffectSuffix) {
                context.report({
                    node,
                    messageId: "effectSuffix",
                    data: {
                        componentName: (_d = node.id) === null || _d === void 0 ? void 0 : _d.name,
                    },
                    fix(fixer) {
                        var _a;
                        if (node.id) {
                            return fixer.replaceText(node.id, ((_a = node.id) === null || _a === void 0 ? void 0 : _a.name) + "Effect");
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
                        componentName: (_e = node.id) === null || _e === void 0 ? void 0 : _e.name,
                    },
                    fix(fixer) {
                        var _a;
                        if (node.id) {
                            return fixer.replaceText(node.id, (_a = node.id) === null || _a === void 0 ? void 0 : _a.name.replace("Effect", ""));
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
