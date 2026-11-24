import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795477704494)
export class AddViewIsPrivateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD "isPrivate" boolean',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "isPrivate" TYPE boolean USING ("visibility" = \'UNLISTED\')',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "isPrivate" SET DEFAULT false, ALTER COLUMN "isPrivate" SET NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN "isPrivate"',
    );
  }
}
