import { RuleTester } from "@typescript-eslint/rule-tester";

import effectComponentsRule from "../rules/effect-components";
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

ruleTester.run("effect-components", effectComponentsRule, {
  valid: [
    {
      code: `const TestComponentEffect = () => <></>;`,
    },
    {
      code: `const TestComponent = () => <div></div>;`,
    },
    {
      code: `export const useUpdateEffect = () => null;`,
    },
    {
      code: `export const useUpdateEffect = () => <></>;`,
    },
    {
      code: `const TestComponent = () => <><div></div></>;`,
    },
    {
      code: `const TestComponentEffect = () => null;`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);

        return null; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return <></>; 
      }`,
    },
    {
      code: `const TestComponentEffect = () => { 
        useEffect(() => {}, []);
        
        return null; 
      }`,
    },
  ],
  invalid: [
    {
      code: "const TestComponent = () => <></>;",
      output: 'const TestComponentEffect = () => <></>;',
      errors: [
        {
          messageId: "effectSuffix",
        },
      ],
    },
    {
      code: "const TestComponentEffect = () => <><div></div></>;",
      output: 'const TestComponent = () => <><div></div></>;',
      errors: [
        {
          messageId: "noEffectSuffix",
        },
      ],
    },
  ],
});

ruleTester.run("styled-components-prefixed-with-styled", styledComponentsPrefixedWithStyledRule, {
  valid: [
    {
      code: 'const StyledButton = styled.button``;',
    },
    {
      code: 'const StyledComponent = styled.div``;',
    },
  ],
  invalid: [
    {
      code: 'const Button = styled.button``;',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const Component = styled.div``;',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const styled = {}; const Button = styled.button``;',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    },
    {
      code: 'const styled = {}; const Component = styled.div``;',
      errors: [
        {
          messageId: 'noStyledPrefix',
        },
      ],
    }
  ],
});
