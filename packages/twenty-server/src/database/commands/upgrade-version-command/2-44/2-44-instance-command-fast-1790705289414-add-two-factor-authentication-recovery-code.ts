import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.44.0', 1790705289414)
export class AddTwoFactorAuthenticationRecoveryCodeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."twoFactorAuthenticationRecoveryCode" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "workspaceId" uuid NOT NULL, "userWorkspaceId" uuid NOT NULL, "codeHash" text NOT NULL, "issuedByUserId" uuid, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "usedAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b9df4c57cf5e79f26b14e81ea81" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_e43ca67c9b33e61693d665dd69" ON "core"."twoFactorAuthenticationRecoveryCode" ("workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_4e13ee80fc7928c2fbce95e4e6" ON "core"."twoFactorAuthenticationRecoveryCode" ("userWorkspaceId") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_e1dcc0914c63aeaaff099a2e9c" ON "core"."twoFactorAuthenticationRecoveryCode" ("codeHash") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_PENDING_UNIQUE" ON "core"."twoFactorAuthenticationRecoveryCode" ("userWorkspaceId") WHERE "usedAt" IS NULL AND "revokedAt" IS NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationRecoveryCode" ADD CONSTRAINT "FK_e43ca67c9b33e61693d665dd69b" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationRecoveryCode" ADD CONSTRAINT "FK_4e13ee80fc7928c2fbce95e4e6f" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationRecoveryCode" ADD CONSTRAINT "FK_d7793a2fde1d93ec4baf2bf1486" FOREIGN KEY ("issuedByUserId") REFERENCES "core"."user"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationRecoveryCode" DROP CONSTRAINT "FK_d7793a2fde1d93ec4baf2bf1486"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationRecoveryCode" DROP CONSTRAINT "FK_4e13ee80fc7928c2fbce95e4e6f"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."twoFactorAuthenticationRecoveryCode" DROP CONSTRAINT "FK_e43ca67c9b33e61693d665dd69b"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_PENDING_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_e1dcc0914c63aeaaff099a2e9c"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_4e13ee80fc7928c2fbce95e4e6"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_e43ca67c9b33e61693d665dd69"',
    );
    await queryRunner.query(
      'DROP TABLE "core"."twoFactorAuthenticationRecoveryCode"',
    );
  }
}
