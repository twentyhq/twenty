import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-state-useref';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const scrollableRef = useRef<HTMLDivElement>(null);',
      filename: 'test.tsx',
    },
    {
      code: 'const ref = useRef<HTMLInputElement>(null);',
      filename: 'test.tsx',
    },
  ],
  invalid: [
    {
      code: 'const ref = useRef(null);',
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
    },
    {
      code: 'const ref = useRef<Boolean>(null);',
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
      filename: 'test.tsx',
    },
    {
      code: "const ref = useRef<string>('');",
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
      filename: 'test.tsx',
    },
  ],
});
