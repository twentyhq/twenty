import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.57.0', 1793995650464)
export class AddCanCreatePermissionsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."role" ADD "canCreateAllObjectRecords" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."objectPermission" ADD "canCreateObjectRecords" boolean');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "canCreateRecords" boolean NOT NULL DEFAULT false');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "canCreateRecords"');
    await queryRunner.query('ALTER TABLE "core"."objectPermission" DROP COLUMN "canCreateObjectRecords"');
    await queryRunner.query('ALTER TABLE "core"."role" DROP COLUMN "canCreateAllObjectRecords"');
  }
}
