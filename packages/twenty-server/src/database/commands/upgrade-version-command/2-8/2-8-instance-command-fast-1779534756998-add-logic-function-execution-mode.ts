import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.8.0', 1779534756998)
export class AddLogicFunctionExecutionModeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."logicFunction_executionmode_enum" AS ENUM('LIVE', 'PREBUILT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "executionMode" "core"."logicFunction_executionmode_enum" NOT NULL DEFAULT 'LIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "executionMode"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."logicFunction_executionmode_enum"`,
    );
  }
}
