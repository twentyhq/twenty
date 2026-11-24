import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795507394217)
export class AddLogicFunctionJobFailureHandlerNameAndRetryLimitFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD "jobFailureHandlerName" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD "retryLimit" integer',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN "retryLimit"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN "jobFailureHandlerName"',
    );
  }
}
