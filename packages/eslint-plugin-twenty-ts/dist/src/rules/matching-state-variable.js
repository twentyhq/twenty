"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@typescript-eslint/utils");
const createRule = utils_1.ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);
const matchingStateVariableRule = createRule({
    create: (context) => {
        return {
            VariableDeclarator(node) {
                var _a, _b, _c, _d, _e, _f, _g;
                if (((_a = node === null || node === void 0 ? void 0 : node.init) === null || _a === void 0 ? void 0 : _a.type) === utils_1.AST_NODE_TYPES.CallExpression &&
                    node.init.callee.type === utils_1.AST_NODE_TYPES.Identifier &&
                    [
                        "useRecoilState",
                        "useRecoilFamilyState",
                        "useRecoilSelector",
                        "useRecoilScopedState",
                        "useRecoilScopedFamilyState",
                        "useRecoilScopedSelector",
                        "useRecoilValue",
                    ].includes(node.init.callee.name)) {
                    const stateNameBase = ((_c = (_b = node.init.arguments) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.type) === utils_1.AST_NODE_TYPES.Identifier
                        ? node.init.arguments[0].name
                        : undefined;
                    if (!stateNameBase) {
                        return;
                    }
                    let expectedVariableNameBase = stateNameBase.replace(/(State|FamilyState|Selector|ScopedState|ScopedFamilyState|ScopedSelector)$/, "");
                    if (node.id.type === utils_1.AST_NODE_TYPES.Identifier) {
                        const actualVariableName = node.id.name;
                        if (actualVariableName !== expectedVariableNameBase) {
                            context.report({
                                node,
                                messageId: "invalidVariableName",
                                data: {
                                    actual: actualVariableName,
                                    expected: expectedVariableNameBase,
                                    callee: node.init.callee.name,
                                },
                                fix(fixer) {
                                    return fixer.replaceText(node.id, expectedVariableNameBase);
                                },
                            });
                        }
                        return;
                    }
                    if (node.id.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                        const actualVariableName = ((_e = (_d = node.id.elements) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.type) === utils_1.AST_NODE_TYPES.Identifier
                            ? node.id.elements[0].name
                            : undefined;
                        if (actualVariableName &&
                            actualVariableName !== expectedVariableNameBase) {
                            context.report({
                                node,
                                messageId: "invalidVariableName",
                                data: {
                                    actual: actualVariableName,
                                    expected: expectedVariableNameBase,
                                    callee: node.init.callee.name,
                                },
                                fix(fixer) {
                                    if (node.id.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                                        return fixer.replaceText(node.id.elements[0], expectedVariableNameBase);
                                    }
                                    return null;
                                },
                            });
                            return;
                        }
                        if (((_g = (_f = node.id.elements) === null || _f === void 0 ? void 0 : _f[1]) === null || _g === void 0 ? void 0 : _g.type) === utils_1.AST_NODE_TYPES.Identifier) {
                            const actualSetterName = node.id.elements[1].name;
                            const expectedSetterName = `set${expectedVariableNameBase
                                .charAt(0)
                                .toUpperCase()}${expectedVariableNameBase.slice(1)}`;
                            if (actualSetterName !== expectedSetterName) {
                                context.report({
                                    node,
                                    messageId: "invalidSetterName",
                                    data: {
                                        actual: actualSetterName,
                                        expected: expectedSetterName,
                                    },
                                    fix(fixer) {
                                        if (node.id.type === utils_1.AST_NODE_TYPES.ArrayPattern) {
                                            return fixer.replaceText(node.id.elements[1], expectedSetterName);
                                        }
                                        return null;
                                    },
                                });
                            }
                        }
                    }
                }
            },
        };
    },
    name: "recoil-hook-naming",
    meta: {
        type: "problem",
        docs: {
            description: "Ensure recoil value and setter are named after their atom name",
            recommended: "recommended",
        },
        fixable: "code",
        schema: [],
        messages: {
            invalidVariableName: "Invalid usage of {{hookName}}: the value should be named '{{expectedName}}' but found '{{actualName}}'.",
            invalidSetterName: "Invalid usage of {{hookName}}: Expected setter '{{expectedName}}' but found '{{actualName}}'.",
        },
    },
    defaultOptions: [],
});
module.exports = matchingStateVariableRule;
exports.default = matchingStateVariableRule;
