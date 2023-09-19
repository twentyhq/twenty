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

ruleTester.run(
  "styled-components-prefixed-with-styled",
  styledComponentsPrefixedWithStyledRule,
  {
    valid: [
      {
        code: "const StyledButton = styled.button``;",
      },
      {
        code: "const StyledComponent = styled.div``;",
      },
    ],
    invalid: [
      {
        code: "const Button = styled.button``;",
        errors: [
          {
            messageId: "noStyledPrefix",
          },
        ],
      },
      {
        code: "const Component = styled.div``;",
        errors: [
          {
            messageId: "noStyledPrefix",
          },
        ],
      },
    ],
  },
);
