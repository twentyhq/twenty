import { RuleTester } from "@typescript-eslint/rule-tester";
import styledComponentsRule from "../rules/styled-components-prefixed-with-styled";

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

ruleTester.run("styled-components-prefixed-with-styled", styledComponentsRule, {
  valid: [
    {
      code: `const StyledComponent = styled.div\`\`;`,
    },
    {
      code: `const StyledButton = styled.button\`\`;`,
    },
  ],
  invalid: [
    {
      code: "const Component = styled.div``;",
      errors: [
        {
          messageId: "styledPrefix",
        },
      ],
      output: "const StyledComponent = styled.div``;",
    },
    {
      code: "const Button = styled.button``;",
      errors: [
        {
          messageId: "styledPrefix",
        },
      ],
      output: "const StyledButton = styled.button``;",
    },
  ],
});
