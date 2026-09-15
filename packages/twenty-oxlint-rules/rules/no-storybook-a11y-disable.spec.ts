import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-storybook-a11y-disable';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: "const meta = { parameters: { a11y: { test: 'error' } } };",
      filename: 'Component.stories.tsx',
    },
    {
      code: 'const meta = { parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST } };',
      filename: 'Component.stories.tsx',
    },
    {
      code: "const config = { test: 'todo' };",
      filename: 'Component.stories.tsx',
    },
    {
      code: "const meta = { args: { a11y: { test: 'off' } } };",
      filename: 'Component.stories.tsx',
    },
  ],
  invalid: [
    {
      code: "const meta = { parameters: { a11y: { test: 'todo' } } };",
      errors: [{ messageId: 'noA11yDisable' }],
      filename: 'Component.stories.tsx',
    },
    {
      code: "const meta = { parameters: { a11y: { test: 'off' } } };",
      errors: [{ messageId: 'noA11yDisable' }],
      filename: 'Component.stories.tsx',
    },
    {
      code: "export const Default = { parameters: { a11y: { test: 'off' } } };",
      errors: [{ messageId: 'noA11yDisable' }],
      filename: 'Component.stories.ts',
    },
  ],
});
