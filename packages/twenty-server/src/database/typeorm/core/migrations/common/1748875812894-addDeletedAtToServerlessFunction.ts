import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtToServerlessFunction1748875812894
  implements MigrationInterface
{
  name = 'AddDeletedAtToServerlessFunction1748875812894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" ADD "deletedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_SERVERLESS_FUNCTION_ID_DELETED_AT" ON "core"."serverlessFunction" ("id", "deletedAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_SERVERLESS_FUNCTION_ID_DELETED_AT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."serverlessFunction" DROP COLUMN "deletedAt"`,
    );
  }
}
