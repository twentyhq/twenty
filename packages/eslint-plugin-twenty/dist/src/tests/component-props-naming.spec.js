"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rule_tester_1 = require("@typescript-eslint/rule-tester");
const component_props_naming_1 = __importDefault(require("../rules/component-props-naming"));
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
ruleTester.run("component-props-naming", component_props_naming_1.default, {
    valid: [
        {
            code: "export const MyComponent= (props: MyComponentProps) => <div>{props.message}</div>;",
        },
        {
            code: "export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;",
        },
    ],
    invalid: [
        {
            code: "export const MyComponent = (props: OwnProps) => <div>{props.message}</div>;",
            errors: [
                {
                    messageId: "invalidPropsTypeName",
                },
            ],
            output: "export const MyComponent = (props: MyComponentProps) => <div>{props.message}</div>;",
        },
        {
            code: "export const MyComponent = ({ message }: OwnProps) => <div>{message}</div>;",
            errors: [
                {
                    messageId: "invalidPropsTypeName",
                },
            ],
            output: "export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;",
        },
    ],
});
