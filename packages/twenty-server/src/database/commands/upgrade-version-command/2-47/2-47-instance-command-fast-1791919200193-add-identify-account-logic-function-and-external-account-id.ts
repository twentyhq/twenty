import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.47.0', 1791919200193)
export class AddIdentifyAccountLogicFunctionAndExternalAccountIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" ADD COLUMN IF NOT EXISTS "identifyAccountLogicFunctionUniversalIdentifier" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ADD COLUMN IF NOT EXISTS "externalAccountId" character varying(512)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" DROP COLUMN IF EXISTS "externalAccountId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" DROP COLUMN IF EXISTS "identifyAccountLogicFunctionUniversalIdentifier"',
    );
  }
}
