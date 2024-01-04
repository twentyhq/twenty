"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const no_state_useref_1 = __importDefault(require("../rules/no-state-useref"));
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
ruleTester.run("no-state-useref", no_state_useref_1.default, {
    valid: [
        {
            code: "const scrollableRef = useRef<HTMLDivElement>(null);",
        },
        {
            code: "const ref = useRef<HTMLInputElement>(null);",
        },
    ],
    invalid: [
        {
            code: "const ref = useRef(null);",
            errors: [
                {
                    messageId: "noStateUseRef",
                },
            ],
        },
        {
            code: "const ref = useRef<Boolean>(null);",
            errors: [
                {
                    messageId: "noStateUseRef",
                },
            ],
        },
        {
            code: "const ref = useRef<string>('');",
            errors: [
                {
                    messageId: "noStateUseRef",
                },
            ],
        },
    ],
});
