import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The index is built concurrently by
// add-two-factor-authentication-recovery-code-index-concurrently. This step
// stays so instances that already recorded it keep a known upgrade cursor.
@RegisteredInstanceCommand('2.46.0', 1791375726691)
export class AddTwoFactorAuthenticationRecoveryCodeIndexFastInstanceCommand implements FastInstanceCommand {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
