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
      filename: 'example.ts',
    },
    {
      code: 'const StyledComponent = styled.div``;',
      filename: 'example.ts',
    },

  ],
  invalid: [
    {
      code: 'const Button = styled.button``;',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const Component = styled.div``;',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const styled = {}; const Button = styled.button``;',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const styled = {}; const Component = styled.div``;',
      filename: 'example.ts',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const StyledButton = styled.button``;',
      filename: 'themes.ts',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },

  ],
});
