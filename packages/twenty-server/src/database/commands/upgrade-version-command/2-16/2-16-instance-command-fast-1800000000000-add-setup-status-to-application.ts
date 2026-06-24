import { QueryRunner } from 'typeorm';

import {
  FastInstanceCommand,
  RegisteredInstanceCommand,
} from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

@RegisteredInstanceCommand('2.16.0', 1800000000000, { type: 'fast' })
export class AddSetupStatusToApplicationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."application_setupstatus_enum" AS ENUM('COMPLETE', 'INCOMPLETE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "setupStatus" "core"."application_setupstatus_enum" NOT NULL DEFAULT 'COMPLETE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "setupStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."application_setupstatus_enum"`,
    );
  }
}
