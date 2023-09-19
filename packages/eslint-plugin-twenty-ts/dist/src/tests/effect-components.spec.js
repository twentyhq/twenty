"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const effect_components_1 = __importDefault(require("../rules/effect-components"));
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
ruleTester.run("effect-components", effect_components_1.default, {
    valid: [
        {
            code: `const TestComponentEffect = () => <></>;`,
        },
        {
            code: `const TestComponent = () => <div></div>;`,
        },
        {
            code: `export const useUpdateEffect = () => null;`,
        },
        {
            code: `export const useUpdateEffect = () => <></>;`,
        },
        {
            code: `const TestComponent = () => <><div></div></>;`,
        },
        {
            code: `const TestComponentEffect = () => null;`,
        },
        {
            code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);

        return null; 
      }`,
        },
        {
            code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
        },
        {
            code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
        },
        {
            code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return null; 
      }`,
        },
    ],
    invalid: [
        {
            code: "const TestComponent = () => <></>;",
            output: 'const TestComponentEffect = () => <></>;',
            errors: [
                {
                    messageId: "effectSuffix",
                },
            ],
        },
        {
            code: "const TestComponentEffect = () => <><div></div></>;",
            output: 'const TestComponent = () => <><div></div></>;',
            errors: [
                {
                    messageId: "noEffectSuffix",
                },
            ],
        },
    ],
});
