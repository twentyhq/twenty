import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.23.0', 1776090711153)
export class AddGlobalObjectContextToCommandMenuItemAvailabilityTypeFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TYPE "core"."commandMenuItem_availabilitytype_enum" RENAME TO "commandMenuItem_availabilitytype_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"commandMenuItem_availabilitytype_enum\" AS ENUM('GLOBAL', 'GLOBAL_OBJECT_CONTEXT', 'RECORD_SELECTION', 'FALLBACK')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" TYPE "core"."commandMenuItem_availabilitytype_enum" USING "availabilityType"::"text"::"core"."commandMenuItem_availabilitytype_enum"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" SET DEFAULT \'GLOBAL\'',
    );
    await queryRunner.query(
      'DROP TYPE "core"."commandMenuItem_availabilitytype_enum_old"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"core\".\"commandMenuItem_availabilitytype_enum_old\" AS ENUM('FALLBACK', 'GLOBAL', 'RECORD_SELECTION')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" DROP DEFAULT',
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "availabilityType" = 'GLOBAL' WHERE "availabilityType" = 'GLOBAL_OBJECT_CONTEXT'`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" TYPE "core"."commandMenuItem_availabilitytype_enum_old" USING "availabilityType"::"text"::"core"."commandMenuItem_availabilitytype_enum_old"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" SET DEFAULT \'GLOBAL\'',
    );
    await queryRunner.query(
      'DROP TYPE "core"."commandMenuItem_availabilitytype_enum"',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."commandMenuItem_availabilitytype_enum_old" RENAME TO "commandMenuItem_availabilitytype_enum"',
    );
  }
}
