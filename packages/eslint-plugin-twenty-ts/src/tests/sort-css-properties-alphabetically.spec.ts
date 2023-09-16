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
        code: `const StyledButton = styled.button\`
          border: none;
          color: #000;
        \`;`,
      },
      {
        code: `const StyledComponent = styled.div\`
          background: #fff;
          color: #000;
        \`;`,
      },
    ],
    invalid: [
      {
        code: "const Component = styled.div`color: #000; background: #fff;`;",
        errors: [
          {
            messageId: "sort-css-properties-alphabetically",
          },
        ],
      },
      {
        code: "const Button = styled.button`color: #000; border: none;`;",
        errors: [
          {
            messageId: "sort-css-properties-alphabetically",
          },
        ],
      },
    ],
  }
);
