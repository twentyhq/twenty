import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.43.0', 1790319254140)
export class AddCommandMenuItemRecordFieldFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD "availabilityFieldMetadataId" uuid',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"commandMenuItem_variant_enum\" AS ENUM('PRIMARY', 'SECONDARY', 'DISABLED')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD "variant" "core"."commandMenuItem_variant_enum" NOT NULL DEFAULT \'SECONDARY\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD "conditionalVariantExpression" character varying',
    );
    await queryRunner.query(
      'ALTER TYPE "core"."commandMenuItem_availabilitytype_enum" RENAME TO "commandMenuItem_availabilitytype_enum_old"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"commandMenuItem_availabilitytype_enum\" AS ENUM('GLOBAL', 'GLOBAL_OBJECT_CONTEXT', 'RECORD_SELECTION', 'FALLBACK', 'RECORD_FIELD')",
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
    await queryRunner.query(
      'CREATE INDEX "IDX_COMMAND_MENU_ITEM_AVAILABILITY_FIELD_METADATA_ID" ON "core"."commandMenuItem" ("availabilityFieldMetadataId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "FK_f5628f70d66ee651c5c71986060" FOREIGN KEY ("availabilityFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "FK_f5628f70d66ee651c5c71986060"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_COMMAND_MENU_ITEM_AVAILABILITY_FIELD_METADATA_ID"',
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"commandMenuItem_availabilitytype_enum_old\" AS ENUM('FALLBACK', 'GLOBAL', 'GLOBAL_OBJECT_CONTEXT', 'RECORD_SELECTION')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" DROP DEFAULT',
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
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN "conditionalVariantExpression"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN "variant"',
    );
    await queryRunner.query('DROP TYPE "core"."commandMenuItem_variant_enum"');
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN "availabilityFieldMetadataId"',
    );
  }
}
