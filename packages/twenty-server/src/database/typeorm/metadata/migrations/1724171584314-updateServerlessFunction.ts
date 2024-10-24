import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServerlessFunction1724171584314
  implements MigrationInterface
{
  name = 'UpdateServerlessFunction1724171584314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "sourceCodeFullPath"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "latestVersion" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" DROP COLUMN "latestVersion"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metadata"."serverlessFunction" ADD "sourceCodeFullPath" character varying NOT NULL`,
    );
  }
}
