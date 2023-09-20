import { RuleTester } from "@typescript-eslint/rule-tester";

import noHardcodedColorsRule from "../rules/no-hardcoded-colors";

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

ruleTester.run("no-hardcoded-colors", noHardcodedColorsRule, {
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
