import { TSESLint } from '@typescript-eslint/utils';

import { rule, RULE_NAME } from './no-state-useref';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const scrollableRef = useRef<HTMLDivElement>(null);',
    },
    {
      code: 'const ref = useRef<HTMLInputElement>(null);',
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
    },
    {
      code: "const ref = useRef<string>('');",
      errors: [
        {
          messageId: 'noStateUseRef',
        },
      ],
    },
  ],
});
