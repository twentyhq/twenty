import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.11.0', 1799000040000)
export class AddLogicFunctionBuildStatusFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."logicFunction_buildstatus_enum" AS ENUM('NOT_BUILT', 'CODE_BUILT', 'READY', 'DEPLOY_FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "buildStatus" "core"."logicFunction_buildstatus_enum" NOT NULL DEFAULT 'READY'`,
    );
    await queryRunner.query(
      `UPDATE "core"."logicFunction" SET "buildStatus" = CASE WHEN "isBuildUpToDate" THEN 'READY' ELSE 'NOT_BUILT' END`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "buildStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."logicFunction_buildstatus_enum"`,
    );
  }
}
