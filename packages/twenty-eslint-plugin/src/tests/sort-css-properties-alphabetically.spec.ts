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

ruleTester.run(
  "sort-css-properties-alphabetically",
  sortCssPropertiesAlphabeticallyRule,
  {
    valid: [
      {
        code: "const style = css`color: red;`;",
      },
      {
        code: "const style = css`background-color: $bgColor;color: red;`;",
      },
      {
        code: "const StyledComponent = styled.div`color: red;`;",
      },
      {
        code: "const StyledComponent = styled.div`background-color: $bgColor;color: red;`;",
      },
    ],
    invalid: [
      {
        code: "const style = css`color: #FF0000;background-color: $bgColor`;",
        output: "const style = css`background-color: $bgColorcolor: #FF0000;`;",
        errors: [
          {
            messageId: "sortCssPropertiesAlphabetically",
          },
        ],
      },
      {
        code: "const StyledComponent = styled.div`color: #FF0000;background-color: $bgColor`;",
        output:
          "const StyledComponent = styled.div`background-color: $bgColorcolor: #FF0000;`;",
        errors: [
          {
            messageId: "sortCssPropertiesAlphabetically",
          },
        ],
      },
    ],
  },
);
