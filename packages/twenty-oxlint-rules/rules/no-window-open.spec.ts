import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './no-window-open';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: 'openUrlInNewTab(url);',
    },
    {
      code: 'popup.open(url);',
    },
    {
      code: 'const open = () => {}; open(url);',
    },
  ],
  invalid: [
    {
      code: "window.open(url, '_blank');",
      errors: [{ messageId: 'noWindowOpen' }],
    },
    {
      code: "window.open(url, '_blank', 'noopener,noreferrer');",
      errors: [{ messageId: 'noWindowOpen' }],
    },
    {
      code: "window['open'](url);",
      errors: [{ messageId: 'noWindowOpen' }],
    },
  ],
});
