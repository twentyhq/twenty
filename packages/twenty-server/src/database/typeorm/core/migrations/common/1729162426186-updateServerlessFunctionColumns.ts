import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateServerlessFunctionColumns1729162426186
  implements MigrationInterface
{
  name = 'UpdateServerlessFunctionColumns1729162426186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "publishedVersions" jsonb NOT NULL DEFAULT '[]'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "publishedVersions"`,
    );
  }
}
