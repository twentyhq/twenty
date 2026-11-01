import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// No-op, built concurrently by a slow command: kept so recorded upgrade cursors still resolve
@RegisteredInstanceCommand('2.46.0', 1791375726691)
export class AddTwoFactorAuthenticationRecoveryCodeIndexFastInstanceCommand implements FastInstanceCommand {
  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
