import { RuleTester } from 'oxlint/plugins-dev';

import { rule, RULE_NAME } from './upgrade-command-filename';

const ruleTester = new RuleTester();

const DUMMY_CODE = 'const x = 1;';
const BASE =
  '/project/packages/twenty-server/src/database/commands/upgrade-version-command';

const filename = (path: string) => `${BASE}/${path}`;

ruleTester.run(RULE_NAME, rule, {
  valid: [
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-workspace-command-1775500001000-add-compose-email.command.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-workspace-command-1775500011000-migrate-message-folder-parent-id-to-external-id.command.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-instance-command-fast-1775500000000-add-foo-column.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-22/1-22-instance-command-fast-1780000000000-create-task-table.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: filename('1-21/1-21-upgrade-version-command.module.ts'),
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/__tests__/1-21-workspace-command.spec.ts',
      ),
    },
    {
      code: DUMMY_CODE,
      filename: '/project/packages/twenty-front/src/components/Button.tsx',
    },
    {
      code: DUMMY_CODE,
      filename: filename('upgrade.command.ts'),
    },
  ],
  invalid: [
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-workspace-command-add-feature.command.ts',
      ),
      errors: [{ messageId: 'invalidWorkspaceCommandFilename' }],
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-workspace-command-12345-short-timestamp.command.ts',
      ),
      errors: [{ messageId: 'invalidWorkspaceCommandFilename' }],
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-instance-command-fast-add-column.ts',
      ),
      errors: [{ messageId: 'invalidInstanceCommandFilename' }],
    },
    {
      code: DUMMY_CODE,
      filename: filename(
        '1-21/1-21-add-compose-email-command-menu-item.command.ts',
      ),
      errors: [{ messageId: 'invalidUpgradeCommandFilename' }],
    },
  ],
});
