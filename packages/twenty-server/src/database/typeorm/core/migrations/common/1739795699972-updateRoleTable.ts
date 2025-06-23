import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoleTable1739795699972 implements MigrationInterface {
  name = 'UpdateRoleTable1739795699972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canReadAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canUpdateAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canSoftDeleteAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canDestroyAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canDestroyAllObjectRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canSoftDeleteAllObjectRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canUpdateAllObjectRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canReadAllObjectRecords"`,
    );
  }
}
