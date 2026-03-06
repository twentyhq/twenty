import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './max-consts-per-file';

const max = 1;

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const A = 1;',
      options: [{ max }],
    },
  ],
  invalid: [
    {
      code: 'const NAME_A = 1;\nconst NAME_B = 2;',
      options: [{ max }],
      errors: [{ messageId: 'tooManyConstants', data: { max } }],
    },
  ],
});
