import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793726601132)
export class AddRlsGrantOperationsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "canReadRecords" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "canUpdateRecords" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "canSoftDeleteRecords" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" ADD "canDestroyRecords" boolean NOT NULL DEFAULT false');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "canDestroyRecords"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "canSoftDeleteRecords"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "canUpdateRecords"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicateGroup" DROP COLUMN "canReadRecords"');
  }
}
