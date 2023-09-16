import { RuleTester } from "@typescript-eslint/rule-tester";

import effectComponentsRule from "../rules/effect-components";
import matchingStateVariableRule from "../rules/matching-state-variable";
import noHardcodedColorsRule from "../rules/no-hardcoded-colors";
import styledComponentsRule from "../rules/styled-components-prefixed-with-styled";
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
      output: "const TestComponentEffect = () => <></>;",
      errors: [
        {
          messageId: "effectSuffix",
        },
      ],
    },
    {
      code: "const TestComponentEffect = () => <><div></div></>;",
      output: "const TestComponent = () => <><div></div></>;",
      errors: [
        {
          messageId: "noEffectSuffix",
        },
      ],
    },
  ],
});;
