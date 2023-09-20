"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const matching_state_variable_1 = __importDefault(require("../rules/matching-state-variable"));
const ruleTester = new rule_tester_1.RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
            jsx: true,
        },
    },
});
ruleTester.run('matching-state-variable', matching_state_variable_1.default, {
    valid: [
        {
            code: 'const variable = useRecoilValue(variableState);',
        },
        {
            code: 'const [variable, setVariable] = useRecoilState(variableState);',
        },
    ],
    invalid: [
        {
            code: 'const myValue = useRecoilValue(variableState);',
            errors: [
                {
                    messageId: 'invalidVariableName',
                },
            ],
            output: 'const variable = useRecoilValue(variableState);',
        },
        {
            code: 'const [myValue, setMyValue] = useRecoilState(variableState);',
            errors: [
                {
                    messageId: 'invalidVariableName',
                },
                {
                    messageId: 'invalidSetterName',
                },
            ],
            output: 'const [variable, setVariable] = useRecoilState(variableState);',
        },
    ],
});
