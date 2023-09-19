"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const styled_components_prefixed_with_styled_1 = __importDefault(require("../rules/styled-components-prefixed-with-styled"));
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
ruleTester.run("styled-components-prefixed-with-styled", styled_components_prefixed_with_styled_1.default, {
    valid: [
        {
            code: 'const StyledButton = styled.button``;',
            filename: 'react.tsx',
        },
        {
            code: 'const StyledComponent = styled.div``;',
            filename: 'react.tsx',
        },
    ],
    invalid: [
        {
            code: 'const Button = styled.button``;',
            filename: 'react.tsx',
            errors: [
                {
                    messageId: 'noStyledPrefix',
                },
            ],
        },
        {
            code: 'const Component = styled.div``;',
            filename: 'react.tsx',
            errors: [
                {
                    messageId: 'noStyledPrefix',
                },
            ],
        },
    ],
});
