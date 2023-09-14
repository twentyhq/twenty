import { RuleTester } from "@typescript-eslint/rule-tester";

import effectComponentsRule from "../rules/effect-components";
import fooBarExampleRule from "../rules/foo-bar-example";

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

ruleTester.run("foo-bar-example", fooBarExampleRule, {
  valid: [
    {
      code: "const foo = 'bar';",
    },
  ],
  invalid: [
    {
      code: "const foo = 'baz';",
      output: 'const foo = "bar";',
      errors: [
        {
          messageId: "fooBar",
        },
      ],
    },
  ],
});

ruleTester.run("effect-components", effectComponentsRule, {
  valid: [
    {
      code: `function TestComponentEffect() { 
        return <></>; 
      }`,
    },
    {
      code: `function TestComponent() { 
        return <div></div>; 
      }`,
    },
    {
      code: `export function useUpdateEffect() { 
        return null;
      }`,
    },
    {
      code: `export function useUpdateEffect() { 
        return <></>;
      }`,
    },
    {
      code: `function TestComponent() { 
        return <><div></div></>; 
      }`,
    },
    {
      code: `function TestComponentEffect() { 
        return null; 
      }`,
    },
    {
      code: `function TestComponentEffect() { 
        useEffect(() => {}, []);

        return null; 
      }`,
    },
    {
      code: `function TestComponentEffect() { 
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
      code: "function TestComponent() { return <></>; }",
      output: 'function TestComponentEffect() { return <></>; }',
      errors: [
        {
          messageId: "effectSuffix",
        },
      ],
    },
    {
      code: "function TestComponentEffect() { return <><div></div></>; }",
      output: 'function TestComponent() { return <><div></div></>; }',
      errors: [
        {
          messageId: "noEffectSuffix",
        },
      ],
    },
  ],
});
