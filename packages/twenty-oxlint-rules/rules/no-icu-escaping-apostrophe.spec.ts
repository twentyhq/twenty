import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-icu-escaping-apostrophe';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'const message = msg`Cron pattern "${pattern}" is invalid`;',
      filename: 'compute-cron-pattern.ts',
    },
    {
      code: "const message = t`It's a nice ${thing}`;",
      filename: 'greeting.ts',
    },
    {
      code: "const message = t`a ''${value}'' b`;",
      filename: 'escaped.ts',
    },
    {
      code: "const message = t`quoted at the end ${value}'`;",
      filename: 'trailing.ts',
    },
    {
      code: "const query = sql`select '${column}' from t`;",
      filename: 'query.ts',
    },
    {
      code: "const message = t`no placeholder here '{}'`;",
      filename: 'literal.ts',
    },
  ],
  invalid: [
    {
      code: "const message = msg`Cron pattern '${pattern}' is invalid`;",
      errors: [{ messageId: 'escapingApostrophe' }],
      filename: 'compute-cron-pattern.ts',
    },
    {
      code: "const message = t`domain '${domainName}'. Expect 1`;",
      errors: [{ messageId: 'escapingApostrophe' }],
      filename: 'dns-manager.service.ts',
    },
    {
      code: "const message = i18n.t`domain '${domainName}' is taken`;",
      errors: [{ messageId: 'escapingApostrophe' }],
      filename: 'member.ts',
    },
    {
      code: "const message = defineMessage`from '${before}' to '${after}'`;",
      errors: [
        { messageId: 'escapingApostrophe' },
        { messageId: 'escapingApostrophe' },
      ],
      filename: 'role.ts',
    },
    {
      code: "const message = t`a '''${value}''' b`;",
      errors: [{ messageId: 'escapingApostrophe' }],
      filename: 'odd-run.ts',
    },
  ],
});
