"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const sort_css_properties_alphabetically_1 = __importDefault(require("../rules/sort-css-properties-alphabetically"));
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
ruleTester.run("sort-css-properties-alphabetically", sort_css_properties_alphabetically_1.default, {
    valid: [
        {
            code: 'const style = css`color: red;`;',
            filename: 'react.tsx',
        },
        {
            code: 'const style = styled.div`background-color: $bgColor;`;',
            filename: 'react.tsx',
        },
    ],
    invalid: [
        {
            code: 'const style = css`color: #FF0000;`;',
            filename: 'react.tsx',
            errors: [
                {
                    messageId: "sort-css-properties-alphabetically",
                    suggestions: [
                        {
                            messageId: "sort-css-properties-alphabetically",
                            output: 'const style = css`color: red;`;',
                        },
                    ],
                },
            ],
        },
        {
            code: 'const style = styled.div`background-color: $bgColor; color: #FFFFFF;`;',
            filename: 'react.tsx',
            errors: [
                {
                    messageId: "sort-css-properties-alphabetically",
                    suggestions: [
                        {
                            messageId: "sort-css-properties-alphabetically",
                            output: 'const style = styled.div`background-color: $bgColor; color: white;`;',
                        },
                    ],
                },
            ],
        },
    ],
});
