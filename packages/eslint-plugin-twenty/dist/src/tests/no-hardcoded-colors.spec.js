"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const no_hardcoded_colors_1 = __importDefault(require("../rules/no-hardcoded-colors"));
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
ruleTester.run("no-hardcoded-colors", no_hardcoded_colors_1.default, {
    valid: [
        {
            code: "const color = theme.background.secondary;",
        },
    ],
    invalid: [
        {
            code: 'const color = "rgb(154,205,50)";',
            errors: [
                {
                    messageId: "hardcodedColor",
                },
            ],
        },
        {
            code: 'const color = { test: "rgb(154,205,50)", test2: "#ADFF2F" }',
            errors: [
                {
                    messageId: "hardcodedColor",
                },
                {
                    messageId: "hardcodedColor",
                },
            ],
        },
        {
            code: "const color = { test: `rgb(${r},${g},${b})`, test2: `#ADFF${test}` }",
            errors: [
                {
                    messageId: "hardcodedColor",
                },
                {
                    messageId: "hardcodedColor",
                },
            ],
        },
        {
            code: 'const color = "#ADFF2F";',
            errors: [
                {
                    messageId: "hardcodedColor",
                },
            ],
        },
    ],
});
