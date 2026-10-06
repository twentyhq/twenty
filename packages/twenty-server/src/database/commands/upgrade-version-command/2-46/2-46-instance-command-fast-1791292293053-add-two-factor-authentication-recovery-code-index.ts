import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.46.0', 1791292293053)
export class AddTwoFactorAuthenticationRecoveryCodeIndexFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_APP_TOKEN_RECOVERY_CODE_PENDING_UNIQUE" ON "core"."appToken" ("userId", "workspaceId") WHERE "type" = \'TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE\' AND "deletedAt" IS NULL AND "revokedAt" IS NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_APP_TOKEN_RECOVERY_CODE_PENDING_UNIQUE"',
    );
  }
}
