import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRoleTable1739795699972 implements MigrationInterface {
  name = 'UpdateRoleTable1739795699972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" ADD "canReadAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" ADD "canUpdateAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" ADD "canSoftDeleteAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" ADD "canDestroyAllObjectRecords" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" DROP COLUMN "canDestroyAllObjectRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" DROP COLUMN "canSoftDeleteAllObjectRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" DROP COLUMN "canUpdateAllObjectRecords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."role" DROP COLUMN "canReadAllObjectRecords"`,
    );
  }
}
