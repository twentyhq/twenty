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
    {
      code: 'const color = "#000000";',
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
      code: 'const color = "#ADFF2F";',
      errors: [
        {
          messageId: "hardcodedColor",
        },
      ],
    },
  ],
});
