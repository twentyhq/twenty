import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './component-props-naming';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'export const MyComponent= (props: MyComponentProps) => <div>{props.message}</div>;',
      filename: 'test.tsx',
    },
    {
      code: 'export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;',
      filename: 'test.tsx',
    },
  ],
  invalid: [
    {
      code: 'export const MyComponent = (props: OwnProps) => <div>{props.message}</div>;',
      errors: [
        {
          messageId: 'invalidPropsTypeName',
        },
      ],
      output:
        'export const MyComponent = (props: MyComponentProps) => <div>{props.message}</div>;',
      filename: 'test.tsx',
    },
    {
      code: 'export const MyComponent = ({ message }: OwnProps) => <div>{message}</div>;',
      errors: [
        {
          messageId: 'invalidPropsTypeName',
        },
      ],
      output:
        'export const MyComponent = ({ message }: MyComponentProps) => <div>{message}</div>;',
      filename: 'test.tsx',
    },
  ],
});
