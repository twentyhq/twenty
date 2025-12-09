import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class NullableApplicationServerlessFunctionLayer1762333916255
  implements MigrationInterface
{
  name = 'NullableApplicationServerlessFunctionLayer1762333916255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "serverlessFunctionLayerId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "serverlessFunctionLayerId" SET NOT NULL`,
    );
  }
}
