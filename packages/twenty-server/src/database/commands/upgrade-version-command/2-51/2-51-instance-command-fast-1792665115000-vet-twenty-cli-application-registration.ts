import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TWENTY_CLI_UNIVERSAL_IDENTIFIER = '20202020-82da-4d5a-afd2-53c52090f5e1';

@RegisteredInstanceCommand('2.51.0', 1792665115000)
export class VetTwentyCliApplicationRegistrationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "isVetted" = true WHERE "universalIdentifier" = $1`,
      [TWENTY_CLI_UNIVERSAL_IDENTIFIER],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration" SET "isVetted" = false WHERE "universalIdentifier" = $1`,
      [TWENTY_CLI_UNIVERSAL_IDENTIFIER],
    );
  }
}
