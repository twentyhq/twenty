import { RuleTester } from "@typescript-eslint/rule-tester";

import componentPropsNamingRule from "../rules/component-props-naming";

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true,
    },
  },
});

ruleTester.run("component-props-naming", componentPropsNamingRule, {
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
      output:
        "export const MyComponent = (props: MyComponentProps) => <div>{props.message}</div>;",
    },
    {
      code: "export const MyComponent = ({ message }: OwnProps) => <div>{message}</div>;",
      errors: [
        {
          messageId: "invalidPropsTypeName",
        },
      ],
      output:
        "export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;",
    },
  ],
});
