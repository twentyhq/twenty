import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.48.0', 1791975194413)
export class AddIdentifyAccountLogicFunctionAndExternalAccountIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" ADD "identifyAccountLogicFunctionUniversalIdentifier" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ADD "externalAccountId" character varying(512)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" DROP COLUMN "externalAccountId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" DROP COLUMN "identifyAccountLogicFunctionUniversalIdentifier"',
    );
  }
}
