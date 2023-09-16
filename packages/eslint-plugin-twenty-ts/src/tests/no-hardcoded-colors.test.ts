import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import rule from "../rules/no-hardcoded-colors";

const { RuleTester } = ESLintUtils;

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
});

ruleTester.run("no-hardcoded-colors", rule, {
  valid: [
    {
      code: 'const color = theme.primaryColor;',
      filename: 'example.ts',
    },
    {
      code: 'const color = "#FFFFFF";',
      filename: 'example.ts',
    },
    // Add more valid cases as needed
  ],
  invalid: [
    {
      code: 'const color = "#FF0000";',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'noHardcodedColors',
        },
      ],
    },
    {
      code: 'const color = "rgba(255, 0, 0, 0.5)";',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'noHardcodedColors',
        },
      ],
    },
    {
      code: 'const color = "#123456";',
      filename: 'themes.ts',
      errors: [
        {
          messageId: 'noHardcodedColors',
        },
      ],
    },
  ],
});
