import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.5.0', 1778550000000)
export class CreateJwtPublicKeyTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."jwtPublicKey" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "kid" character varying NOT NULL,
        "publicKey" character varying NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jwtPublicKey_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_JWT_PUBLIC_KEY_KID_UNIQUE" ON "core"."jwtPublicKey" ("kid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_JWT_PUBLIC_KEY_KID_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."jwtPublicKey"`);
  }
}
