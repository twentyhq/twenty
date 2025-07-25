import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnyFieldFilterValueColumnOnView1753349164408
  implements MigrationInterface
{
  name = 'CreateAnyFieldFilterValueColumnOnView1753349164408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "anyFieldFilterValue" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "anyFieldFilterValue"`,
    );
  }
}
