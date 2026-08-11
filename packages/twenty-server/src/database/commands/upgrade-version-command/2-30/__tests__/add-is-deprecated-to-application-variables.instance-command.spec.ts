import { type QueryRunner } from 'typeorm';

import { AddIsDeprecatedToApplicationVariablesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-30/2-30-instance-command-fast-1786356853935-add-is-deprecated-to-application-variables';
import { ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-30/add-is-deprecated-to-application-variables-upgrade-command-name.constant';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

describe('AddIsDeprecatedToApplicationVariablesFastInstanceCommand', () => {
  let command: AddIsDeprecatedToApplicationVariablesFastInstanceCommand;

  beforeEach(() => {
    command = new AddIsDeprecatedToApplicationVariablesFastInstanceCommand();
  });

  describe('registration', () => {
    it('is registered against 2.30.0 so it stays dormant until 2.30 is current', () => {
      const metadata = getRegisteredInstanceCommandMetadata(
        AddIsDeprecatedToApplicationVariablesFastInstanceCommand,
      );

      expect(metadata).toEqual({
        version: '2.30.0',
        timestamp: 1786356853935,
        type: 'fast',
      });
    });

    it('has a name constant matching its computed registered name', () => {
      const metadata = getRegisteredInstanceCommandMetadata(
        AddIsDeprecatedToApplicationVariablesFastInstanceCommand,
      );

      expect(
        `${metadata?.version}_${AddIsDeprecatedToApplicationVariablesFastInstanceCommand.name}_${metadata?.timestamp}`,
      ).toBe(ADD_IS_DEPRECATED_TO_APPLICATION_VARIABLES_UPGRADE_COMMAND_NAME);
    });
  });

  describe('up', () => {
    it('adds isDeprecated to both tables and the deprecated-not-required constraint', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.up(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "isDeprecated" boolean NOT NULL DEFAULT false',
        'ALTER TABLE "core"."applicationRegistrationVariable" ADD COLUMN IF NOT EXISTS "isDeprecated" boolean NOT NULL DEFAULT false',
        'ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationRegistrationVariable_deprecated_not_required"',
        'ALTER TABLE "core"."applicationRegistrationVariable" ADD CONSTRAINT "CHK_applicationRegistrationVariable_deprecated_not_required" CHECK (NOT ("isRequired" AND "isDeprecated"))',
      ]);
    });
  });

  describe('down', () => {
    it('drops the constraint then isDeprecated from both tables in reverse order', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.down(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."applicationRegistrationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationRegistrationVariable_deprecated_not_required"',
        'ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN IF EXISTS "isDeprecated"',
        'ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "isDeprecated"',
      ]);
    });
  });
});
