import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './effect-components';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: `const TestComponentEffect = () => <></>;`,
      filename: 'test.tsx',
    },
    {
      code: `const TestComponent = () => <div></div>;`,
      filename: 'test.tsx',
    },
    {
      code: `export const useUpdateEffect = () => null;`,
    },
    {
      code: `export const useUpdateEffect = () => <></>;`,
      filename: 'test.tsx',
    },
    {
      code: `const TestComponent = () => <><div></div></>;`,
      filename: 'test.tsx',
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
      filename: 'test.tsx',
    },
  ],
  invalid: [
    {
      code: 'const TestComponent = () => <></>;',
      output: 'const TestComponentEffect = () => <></>;',
      errors: [
        {
          messageId: 'addEffectSuffix',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: 'const TestComponentEffect = () => <><div></div></>;',
      output: 'const TestComponent = () => <><div></div></>;',
      errors: [
        {
          messageId: 'removeEffectSuffix',
        },
      ],
      filename: 'test.tsx',
    },
  ],
});
