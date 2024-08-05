import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRuntimeColumnToServerlessFunction1721309629608
  implements MigrationInterface
{
  name = 'AddRuntimeColumnToServerlessFunction1721309629608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "runtime" character varying NOT NULL DEFAULT 'nodejs18.x'`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "description" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "sourceCodeFullPath" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "runtime"`,
    );

    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "description"`,
    );

    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "sourceCodeFullPath"`,
    );
  }
}
