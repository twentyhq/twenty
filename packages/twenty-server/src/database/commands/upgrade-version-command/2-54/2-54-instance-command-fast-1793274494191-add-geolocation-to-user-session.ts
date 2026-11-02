import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.54.0', 1793274494191)
export class AddGeolocationToUserSessionFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."userSession" ADD "country" text',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."userSession" ADD "region" text',
    );
    await queryRunner.query('ALTER TABLE "core"."userSession" ADD "city" text');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."userSession" DROP COLUMN "city"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."userSession" DROP COLUMN "region"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."userSession" DROP COLUMN "country"',
    );
  }
}
