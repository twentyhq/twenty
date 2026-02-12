/**
 * @jest-environment node
 */
import { RuleTester } from 'eslint';

import { rule, RULE_NAME } from './export-component-props';

const typescriptParser = require('@typescript-eslint/parser');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run(RULE_NAME, rule as any, {
  valid: [
    {
      name: 'Props type is already exported',
      code: `
        export type MyComponentProps = { label: string };
      `,
    },
    {
      name: 'Props interface is already exported',
      code: `
        export interface MyComponentProps { label: string }
      `,
    },
    {
      name: 'Type that doesn\'t end with Props is ignored',
      code: `
        type MyComponentOptions = { flag: boolean };
      `,
    },
    {
      name: 'Interface that doesn\'t end with Props is ignored',
      code: `
        interface MyComponentConfig { flag: boolean }
      `,
    },
    {
      name: 'Props re-exported via export { FooProps } is treated as exported',
      code: `
        type MyComponentProps = { label: string };
        export { MyComponentProps };
      `,
    },
    {
      name: 'Non-Props type is not required to be exported',
      code: `
        type InternalState = { count: number };
      `,
    },
  ],
  invalid: [
    {
      name: 'Unexported Props type alias',
      code: `
        type MyComponentProps = { label: string };
      `,
      errors: [{ messageId: 'mustExportProps' }],
      output: `
        export type MyComponentProps = { label: string };
      `,
    },
    {
      name: 'Unexported Props interface',
      code: `
        interface MyComponentProps { label: string }
      `,
      errors: [{ messageId: 'mustExportProps' }],
      output: `
        export interface MyComponentProps { label: string }
      `,
    },
    {
      name: 'Unexported Props type used in a component',
      code: `
        type MyComponentProps = { label: string };
        export const MyComponent = ({ label }: MyComponentProps) => <div>{label}</div>;
      `,
      errors: [{ messageId: 'mustExportProps' }],
      output: `
        export type MyComponentProps = { label: string };
        export const MyComponent = ({ label }: MyComponentProps) => <div>{label}</div>;
      `,
    },
    {
      name: 'Unexported Props type with non-exported component',
      code: `
        type MyComponentProps = { label: string };
        const MyComponent = ({ label }: MyComponentProps) => <div>{label}</div>;
      `,
      errors: [{ messageId: 'mustExportProps' }],
      output: `
        export type MyComponentProps = { label: string };
        const MyComponent = ({ label }: MyComponentProps) => <div>{label}</div>;
      `,
    },
    {
      name: 'Unexported Props type defined after the component',
      code: `
        export const MyComponent = ({ label }: MyComponentProps) => <div>{label}</div>;
        type MyComponentProps = { label: string };
      `,
      errors: [{ messageId: 'mustExportProps' }],
      output: `
        export const MyComponent = ({ label }: MyComponentProps) => <div>{label}</div>;
        export type MyComponentProps = { label: string };
      `,
    },
  ],
});
