import { RuleTester } from "@typescript-eslint/rule-tester";

import componentPropsNamingRule from "../rules/component-props.naming";

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
      code: `
      type MyComponentProps = { id: number; };
      const MyComponent: React.FC<MyComponentProps> = (props) => <div>{props.id}</div>;
      `,
    },
    {
      code: `
      type AnotherComponentProps = { message: string; };
      export const AnotherComponent: React.FC<AnotherComponentProps> = (props) => <div>{props.message}</div>;
      `,
    },
  ],
  invalid: [
    {
      code: `
      type UnmatchedComponentProps = { id: number; };
      `,
      errors: [
        {
          messageId: "invalidPropsTypeName",
        },
      ],
    },
    {
      code: `
      type UnmatchedComponentProps = { message: string; };
      const DifferentComponent: React.FC<UnmatchedComponentProps> = (props) => <div>{props.message}</div>;
      `,
      errors: [
        {
          messageId: "invalidPropsTypeName",
        },
      ],
    },
  ],
});
