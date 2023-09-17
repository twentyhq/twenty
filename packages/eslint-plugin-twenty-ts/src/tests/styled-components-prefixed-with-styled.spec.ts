import { RuleTester } from "@typescript-eslint/rule-tester";
import styledComponentsPrefixedWithStyledRule from "../rules/styled-components-prefixed-with-styled";

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

ruleTester.run("styled-components-prefixed-with-styled", styledComponentsPrefixedWithStyledRule, {
  valid: [
    {
      code: 'const StyledButton = styled.button``;',
      filename: 'react.tsx',
    },
    {
      code: 'const StyledComponent = styled.div``;',
      filename: 'react.tsx',
    },
  ],
  invalid: [
    {
      code: 'const Button = styled.button``;',
      filename: 'react.tsx',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const Component = styled.div``;',
      filename: 'react.tsx',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
  ],
});
