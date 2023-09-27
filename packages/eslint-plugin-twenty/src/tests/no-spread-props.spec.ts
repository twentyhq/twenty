import { RuleTester } from "@typescript-eslint/rule-tester";

import noSpreadPropsRule from "../rules/no-spread-props";

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

ruleTester.run("no-spread-props", noSpreadPropsRule, {
  valid: [
    {
      code: "<MyComponent prop1={value} prop2={value} />",
    },
    {
      code: "<MyComponent {...{prop1, prop2}} />",
    },
  ],
  invalid: [
    {
      code: "<MyComponent {...props} />",
      errors: [
        {
          messageId: "noSpreadProps",
        },
      ],
    },
  ],
});
