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
      code: 'const color = theme.primaryColor;',
      filename: 'example.ts',
    },
    {
      code: 'const color = "#FFFFFF";',
      filename: 'example.ts',
    },
  ],
  invalid: [
    {
      code: 'const color = "#FF0000";',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'avoidHardcodedColors',
        },
      ],
    },
    {
      code: 'const color = "rgba(255, 0, 0, 0.5)";',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'avoidHardcodedColors',
        },
      ],
    },
    {
      code: 'const color = "#123456";',
      filename: 'themes.ts',
      errors: [
        {
          messageId: 'avoidHardcodedColors',
        },
      ],
    },
  ],
});
