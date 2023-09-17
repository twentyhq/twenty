import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import rule from "../rules/sort-css-properties-alphabetically";

const { RuleTester } = ESLintUtils;

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
});

ruleTester.run("sort-css-properties-alphabetically", rule, {
  valid: [
    {
      code: 'const style = css`color: red;`;',
      filename: 'example.ts',
    },
    {
      code: 'const style = styled.div`background-color: $bgColor;`;',
      filename: 'example.ts',
    },
    // Add more valid cases as needed
  ],
  invalid: [
    {
      code: 'const style = css`color: #FF0000;`;',
      filename: 'example.ts',
      errors: [
        {
          messageId: "sort-css-properties-alphabetically",
          suggestions: [
            {
              messageId: "sort-css-properties-alphabetically",
              output: 'const style = css`color: red;`;',
            },
          ],
        },
      ],
    },
    {
      code: 'const style = styled.div`background-color: $bgColor; color: #FFFFFF;`;',
      filename: 'example.ts',
      errors: [
        {
          messageId: "sort-css-properties-alphabetically",
          suggestions: [
            {
              messageId: "sort-css-properties-alphabetically",
              output: 'const style = styled.div`background-color: $bgColor; color: white;`;',
            },
          ],
        },
      ],
    },
    // Add more invalid cases as needed
  ],
});
