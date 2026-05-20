import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.5.0', 1778550000000)
export class CreateSigningKeyTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."signingKey" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "publicKey" character varying NOT NULL,
        "privateKey" character varying,
        "isCurrent" boolean NOT NULL DEFAULT false,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_signingKey_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_SIGNING_KEY_IS_CURRENT_UNIQUE" ON "core"."signingKey" ("isCurrent") WHERE "isCurrent" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_SIGNING_KEY_IS_CURRENT_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."signingKey"`);
  }
}
