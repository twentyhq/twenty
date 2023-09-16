import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import rule from "../rules/styled-components-prefixed-with-styled";

const { RuleTester } = ESLintUtils;

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
});

ruleTester.run("styled-components-prefixed-with-styled", rule, {
  valid: [
    {
      code: 'const StyledButton = styled.button``;',
      filename: 'example.ts',
    },
    {
      code: 'const StyledComponent = styled.div``;',
      filename: 'example.ts',
    },
    // Add more valid cases as needed
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
    // Add more invalid cases as needed
  ],
});
