import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNonNullableProductDescription1737127856478
  implements MigrationInterface
{
  name = 'AddNonNullableProductDescription1737127856478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ALTER COLUMN "description" SET DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ALTER COLUMN "description" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ALTER COLUMN "description" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }
}
