import { RuleTester } from "@typescript-eslint/rule-tester";
import sortCssPropertiesAlphabeticallyRule from "../rules/sort-css-properties-alphabetically";

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

ruleTester.run("sort-css-properties-alphabetically", sortCssPropertiesAlphabeticallyRule, {
  valid: [
    {
      code: 'const style = css`color: red;`;',
      filename: 'react.tsx',
    },
    {
      code: 'const style = styled.div`background-color: $bgColor;`;',
      filename: 'react.tsx',
    },
  ],
  invalid: [
    {
      code: 'const style = css`color: #FF0000;`;',
      filename: 'react.tsx',
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
      filename: 'react.tsx',
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
  ],
});
